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
  daily_usage?: string;
  monthly_usage?: string;
  usage_limits?: string;
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
    <View style={styles.rowIconContainer}>
      <Icon name={icon} size={20} color={darkGray} />
    </View>
    <View style={styles.rowContent}>
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
    daily_usage: '',
    monthly_usage: '',
    usage_limits: '',
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
          title: 'Property Address',
          value: userData.property_address || '',
          isEditable: true,
          key: 'property_address'
        },
        {
          icon: 'document-text',
          title: 'Property Type',
          value: userData.property_description || '',
          isEditable: true,
          key: 'property_description'
        }
      ]
    },
    {
      title: 'EstateGPT USAGE',
      data: [
        {
          icon: 'today',
          title: 'Daily',
          value: userData.daily_usage || '',
          key: 'daily_usage'
        },
        {
          icon: 'calendar',
          title: 'Monthly',
          value: userData.monthly_usage || '',
          key: 'monthly_usage'
        },
        {
          icon: 'speedometer',
          title: 'Limits',
          value: userData.usage_limits || '',
          key: 'usage_limits'
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
      Alert.alert('Success', 'Profile updated successfully');
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
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? updateUserData() : setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={darkGray} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
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
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkGray}
              colors={[darkGray]}
              progressBackgroundColor="#ffffff"
            />
          }
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                EstateGPT © {new Date().getFullYear()}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#F8F8F8',
    padding: 12,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    maxWidth: '60%',
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  editButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});