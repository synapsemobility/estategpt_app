import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SectionList,
  RefreshControl
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getCurrentUser } from '@aws-amplify/auth';

const darkGray = 'rgba(26, 26, 26, 1)';
const baseURL = "https://chat.estategpt.io/api/users";

interface UserData {
  userID: string;
  name?: string;
  email?: string;
  property_address?: string;
  property_description?: string;
  synapse_usage?: string;
  phone_number?: string;
  subscription_plan?: string;
  account_created_date?: string;
}

interface RowProps {
  icon: keyof typeof Icon.glyphMap;
  title: string;
  value: string;
  onChangeText?: (text: string) => void;
  isEditable?: boolean;
  isEditing?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, title, value, onChangeText, isEditable, isEditing }) => (
  <View style={styles.row}>
    <Icon name={icon} size={20} color={darkGray} />
    <Text style={styles.rowTitle}>{title}</Text>
    {isEditable && isEditing ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${title}`}
      />
    ) : (
      <Text style={styles.rowValue}>{value}</Text>
    )}
  </View>
);

type RootStackParamList = {
  UserScreen: { userID: string };
  // ... other screens
};

type Props = NativeStackScreenProps<RootStackParamList, 'UserScreen'>;

export const UserScreen: React.FC<Props> = ({ route, navigation }) => {
  const [userID, setUserID] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    userID: userID,
    name: '',
    email: '',
    property_address: '',
    property_description: '',
    synapse_usage: '',
    phone_number: '',
    subscription_plan: '',
    account_created_date: ''
  });

  const sections = [
    {
      title: 'ACCOUNT',
      data: [
        {
          icon: 'person-outline' as const,
          title: 'Name',
          value: userData.name || '',
          isEditable: true,
          key: 'name'
        },
        {
          icon: 'mail',
          title: 'Email',
          value: userData.email || '',
          key: 'email'
        }
      ]
    },
    {
      title: 'PROPERTY',
      data: [
        {
          icon: 'home',
          title: 'Address',
          value: userData.property_address || '',
          isEditable: true,
          key: 'property_address'
        },
        {
          icon: 'document-text',
          title: 'Description',
          value: userData.property_description || '',
          isEditable: true,
          key: 'property_description'
        }
      ]
    },
    {
      title: 'USAGE',
      data: [
        {
          icon: 'stats-chart',
          title: 'EstateGPT Usage',
          value: userData.synapse_usage || '',
          key: 'synapse_usage'
        }
      ]
    },
    {
      title: 'SUBSCRIPTION',
      data: [
        {
          icon: 'star',
          title: 'Subscription',
          value: userData.subscription_plan || '',
          key: 'subscription_plan'
        },
        {
          icon: 'calendar',
          title: 'Account Created',
          value: userData.account_created_date || '',
          key: 'account_created_date'
        }
      ]
    }
  ];

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData(userID);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userID]);

  useEffect(() => {
    const getUserID = async () => {
      try {
        const user = await getCurrentUser();
        setUserID(user.userId);
        fetchUserData(user.userId);
      } catch (error) {
        Alert.alert('Error', 'Could not get user information');
        navigation.goBack();
      }
    };
    
    getUserID();
  }, []);

  const fetchUserData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': id
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        name: userData.name,
        property_address: userData.property_address,
        property_description: userData.property_description,
        phone_number: userData.phone_number
      };

      const response = await fetch(`${baseURL}/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userID
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="User Profile" 
        rightButton={
          <TouchableOpacity onPress={() => isEditing ? updateUserData() : setIsEditing(true)}>
            <Text style={styles.editButton}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={darkGray} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.key + index}
          renderItem={({ item }) => (
            <Row
              icon={item.icon}
              title={item.title}
              value={item.value}
              isEditable={item.isEditable}
              isEditing={isEditing}
              onChangeText={item.isEditable ? (text) => {
                setUserData(prev => ({ ...prev, [item.key]: text }))
              } : undefined}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkGray}
              colors={[darkGray]}
              progressBackgroundColor="#ffffff"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f2f2f7',
    padding: 8,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowTitle: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    flex: 1,
    padding: 0,
  },
  editButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});