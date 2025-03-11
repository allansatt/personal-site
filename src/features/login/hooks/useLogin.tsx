import { AuthFlowType, ChallengeNameType, CognitoIdentityProviderClient, InitiateAuthCommand, RespondToAuthChallengeCommand } from "@aws-sdk/client-cognito-identity-provider"

function login(username:string){
    const client = new CognitoIdentityProviderClient({region: 'us-east-1'})
    const initiateAuth = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_AUTH,
        AuthParameters: { USERNAME: username},
        ClientId: '6in64kdn143hc351pq4v3qua7a'
    })
    client.send(initiateAuth).then(
        (response) => {
            console.log(response)
            if(response.ChallengeName === ChallengeNameType.SELECT_CHALLENGE){
                return client.send(new RespondToAuthChallengeCommand({
                    ChallengeName: ChallengeNameType.SELECT_CHALLENGE,
                    ClientId: '6in64kdn143hc351pq4v3qua7a',
                    ChallengeResponses: {USERNAME: username, ANSWER: ChallengeNameType.EMAIL_OTP},
                    Session: response.Session
                }))
            }
            else{
                console.log('fucked it up')
               throw Error('Unexpected challenge')
            }
        }
    ).then(
        (response) => {
            console.log(response)
    })
    
}

export default login