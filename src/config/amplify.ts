import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports'; // or wherever your config is
import { webBrowser } from '@aws-amplify/rtn-web-browser';

Amplify.configure({
  ...awsconfig,
  Auth: {
    Cognito: {
      webBrowser: webBrowser,
      userPoolId: awsconfig.aws_user_pools_id,
      userPoolClientId: awsconfig.aws_user_pools_web_client_id,
      identityPoolId: awsconfig.aws_cognito_identity_pool_id,
      signUpVerificationMethod: 'code',
      loginWith: {
        oauth: {
          ...awsconfig.oauth,
          responseType: 'code'
        }
      }
    }
  }
});
