import os
from flask import request, jsonify, Response
from twilio.rest import Client
from twilio.jwt.access_token import AccessToken
from twilio.jwt.access_token.grants import VideoGrant
from twilio.base.exceptions import TwilioRestException

class VideoService:
    # ...existing code...
    
    def check_room_status_endpoint(self) -> Response:
        """
        Endpoint to check if a Twilio video room has participants.
        Returns hasParticipants: true if at least one participant (likely the professional) is in the room.
        This allows clients to wait in a "waiting room" until the professional joins.
        """
        try:
            # Get authorization
            user_id = request.headers.get('Authorization')
            if not user_id:
                return jsonify({'error': 'Unauthorized'}), 401
            
            # Get meeting ID from request body
            data = request.get_json()
            meeting_id = data.get('meetingId')
            
            if not meeting_id:
                return jsonify({'error': 'Meeting ID is required'}), 400
            
            # Room name based on meeting ID
            room_name = f"meeting-{meeting_id}"
            
            # Query Twilio API for this room's status
            try:
                # First check if the room exists - look for currently in-progress rooms
                rooms = list(self.client.video.rooms.list(status='in-progress', unique_name=room_name))
                
                if not rooms:
                    # If room doesn't exist, just return empty participant list
                    print(f"Room {room_name} not found or not active")
                    return jsonify({
                        'hasParticipants': False,
                        'participantCount': 0,
                        'roomExists': False
                    })
                
                # Room exists, get participants
                room = rooms[0]  # Get the first room matching our criteria
                try:
                    participants = list(self.client.video.rooms(room.sid).participants.list())
                    
                    # Consider the room active if there's at least one participant
                    has_participants = len(participants) > 0
                    
                    return jsonify({
                        'hasParticipants': has_participants,
                        'participantCount': len(participants),
                        'roomExists': True
                    })
                    
                except TwilioRestException as participant_error:
                    print(f"Error fetching participants: {participant_error}")
                    return jsonify({
                        'hasParticipants': False,
                        'participantCount': 0,
                        'roomExists': True  # Room exists but couldn't get participants
                    })
                    
            except TwilioRestException as room_error:
                # Specific Twilio error
                print(f"Twilio API error when checking room: {room_error}")
                return jsonify({
                    'hasParticipants': False,
                    'roomExists': False,
                    'error': str(room_error)
                }), 200  # Still return 200 for client to handle
                
            except Exception as general_error:
                # General error during room check
                print(f"General error checking room: {general_error}")
                return jsonify({
                    'hasParticipants': False,
                    'roomExists': False,
                    'error': 'Room check failed'
                }), 200  # Still return 200 for client to handle
                
        except Exception as e:
            print(f"Error in room status endpoint: {e}")
            return jsonify({
                'error': str(e), 
                'hasParticipants': False,
                'roomExists': False
            }), 500
