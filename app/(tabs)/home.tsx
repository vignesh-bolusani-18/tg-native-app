// app/(tabs)/home.tsx
import { Buffer } from 'buffer';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { signOutUser } from '../../redux/actions/authActions';

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userInfo, userData, isAuthenticated } = useSelector((state: any) => state.auth);
  const [tokens, setTokens] = useState<any>({});

  useEffect(() => {
    checkStoredTokens();
  }, []);

  const checkStoredTokens = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userToken = await SecureStore.getItemAsync('userToken');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const refreshAuthToken = await SecureStore.getItemAsync('refresh_auth_token');
      
      setTokens({
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 30) + '...' : 'None',
        hasUserToken: !!userToken,
        hasRefreshToken: !!refreshToken,
        hasRefreshAuthToken: !!refreshAuthToken,
      });

      console.log('🔍 FULL TOKEN DEBUG:');
      console.log('📊 token (main):', token || 'NULL');
      console.log('📊 userToken:', userToken || 'NULL');
      console.log('📊 refresh_token:', refreshToken || 'NULL');
      console.log('📊 refresh_auth_token:', refreshAuthToken || 'NULL');
      
      // Decode JWT to see payload
      if (token) {
        try {
          const parts = token.split('.');
          const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          console.log('🔓 Decoded JWT:', decoded);
        } catch (e) {
          console.error('Failed to decode JWT:', e);
        }
      }
    } catch (error) {
      console.error('Error reading tokens:', error);
    }
  };

  const handleSignOut = async () => {
    await dispatch(signOutUser() as any);
    router.replace('/auth/login');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <View style={{ padding: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Text style={{ 
              fontSize: 28, 
              fontWeight: '700', 
              color: '#111827',
              marginBottom: 4,
              flexShrink: 1
            }}>
              Welcome to TrueGradient
            </Text>
            <Button 
              mode="contained" 
              onPress={() => router.push('/vibe')}
              style={{ backgroundColor: '#3B82F6', marginVertical: 5 }}
            >
              Go to Agent
            </Button>
          </View>
          <Text style={{ fontSize: 15, color: '#374151', fontWeight: '500' }}>
            Your authentication dashboard
          </Text>
        </View>

        {/* Status Card */}
        <Card style={{ 
          marginBottom: 16, 
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 1
        }}>
          <Card.Title 
            title="Authentication Status" 
            titleStyle={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}
          />
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>Authenticated:</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: isAuthenticated ? '#10B981' : '#EF4444' }}>
                {isAuthenticated ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>Email:</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937' }}>
                {userInfo?.email || userData?.email || 'N/A'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>User ID:</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
                {userInfo?.sub || userData?.sub || 'N/A'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Tokens Card */}
        <Card style={{ 
          marginBottom: 16, 
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 1
        }}>
          <Card.Title 
            title="Stored Tokens" 
            titleStyle={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}
          />
          <Card.Content>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>Access Token:</Text>
              <Text style={{ fontSize: 15, fontWeight: '700' }}>
                {tokens.hasToken ? '✅' : '❌'}
              </Text>
            </View>
            {tokens.hasToken && (
              <View style={{
                backgroundColor: '#F3F4F6',
                padding: 12,
                borderRadius: 8,
                marginBottom: 12
              }}>
                <Text style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                  {tokens.tokenPreview}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>User Token:</Text>
              <Text style={{ fontSize: 15, fontWeight: '700' }}>
                {tokens.hasUserToken ? '✅' : '❌'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>Refresh Token:</Text>
              <Text style={{ fontSize: 15, fontWeight: '700' }}>
                {tokens.hasRefreshToken ? '✅' : '❌'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#111827', flex: 1, fontWeight: '500' }}>Refresh Auth Token:</Text>
              <Text style={{ fontSize: 15, fontWeight: '700' }}>
                {tokens.hasRefreshAuthToken ? '✅' : '❌'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Redux State Card */}
        <Card style={{ 
          marginBottom: 16, 
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          elevation: 1
        }}>
          <Card.Title 
            title="Redux State" 
            titleStyle={{ fontSize: 18, fontWeight: '600', color: '#1F2937' }}
          />
          <Card.Content>
            <View style={{
              backgroundColor: '#F3F4F6',
              padding: 12,
              borderRadius: 8
            }}>
              <Text style={{ fontSize: 12, color: '#374151', fontFamily: 'monospace', lineHeight: 18 }}>
                {JSON.stringify({ userInfo, userData, isAuthenticated }, null, 2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Button 
          mode="contained" 
          onPress={checkStoredTokens} 
          style={{ 
            marginBottom: 12,
            borderRadius: 10,
            height: 52,
            elevation: 4,
            shadowColor: '#6366F1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
          }}
          buttonColor="#6366F1"
          labelStyle={{ 
            fontSize: 16, 
            fontWeight: '700',
            letterSpacing: 0.5
          }}
        >
          Refresh Token Check
        </Button>

        <Button 
          mode="outlined" 
          onPress={handleSignOut}
          style={{
            borderRadius: 10,
            height: 52,
            borderColor: '#EF4444',
            borderWidth: 2,
            elevation: 2,
            shadowColor: '#EF4444',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            backgroundColor: '#FFFFFF'
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '700',
            color: '#EF4444',
            letterSpacing: 0.5
          }}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
}
