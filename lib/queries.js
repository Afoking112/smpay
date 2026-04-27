import { gql } from '@apollo/client';

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      success
      message
      token
      user {
        id
        name
        phone
        email
        role
        walletBalance
        state
        address
        profilePicture
        telegramUsername
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      token
      user {
        id
        name
        phone
        email
        role
        walletBalance
        state
        address
        profilePicture
        telegramUsername
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      phone
      email
      role
      walletBalance
      state
      address
      profilePicture
      telegramUsername
      createdAt
      transactionCount
      serviceRequestCount
      supportMessageCount
    }
  }
`;

export const WALLET_BALANCE_QUERY = gql`
  query WalletBalance {
    walletBalance
  }
`;

export const TRANSACTIONS_QUERY = gql`
  query Transactions($limit: Int, $offset: Int) {
    transactions(limit: $limit, offset: $offset) {
      id
      service
      amount
      status
      type
      reference
      createdAt
    }
  }
`;

export const FUND_WALLET_MUTATION = gql`
  mutation FundWallet($amount: Float!) {
    fundWallet(amount: $amount) {
      success
      message
      data {
        authorization_url
        access_code
        reference
      }
    }
  }
`;

export const SERVICE_REQUESTS_QUERY = gql`
  query ServiceRequests($limit: Int, $status: String, $category: String) {
    serviceRequests(limit: $limit, status: $status, category: $category) {
      id
      category
      title
      provider
      accountOrPhone
      amount
      direction
      note
      status
      feePercentage
      expectedCredit
      createdAt
    }
  }
`;

export const VERIFY_WALLET_FUNDING_MUTATION = gql`
  mutation VerifyWalletFunding($reference: String!) {
    verifyWalletFunding(reference: $reference) {
      success
      message
      transaction {
        id
        service
        amount
        status
        type
        reference
        createdAt
      }
    }
  }
`;

export const BUY_AIRTIME_MUTATION = gql`
  mutation BuyAirtime($input: BuyAirtimeInput!) {
    buyAirtime(input: $input) {
      success
      message
      transaction {
        id
        service
        amount
        status
        reference
      }
    }
  }
`;

export const BUY_DATA_MUTATION = gql`
  mutation BuyData($input: BuyDataInput!) {
    buyData(input: $input) {
      success
      message
      transaction {
        id
        service
        amount
        status
        reference
      }
    }
  }
`;

export const SUBMIT_SERVICE_REQUEST_MUTATION = gql`
  mutation SubmitServiceRequest($input: ServiceRequestInput!) {
    submitServiceRequest(input: $input) {
      success
      message
      request {
        id
        category
        title
        provider
        accountOrPhone
        amount
        direction
        note
        status
        feePercentage
        expectedCredit
        createdAt
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      success
      message
      user {
        id
        name
        phone
        email
        role
        walletBalance
        state
        address
        profilePicture
        telegramUsername
        createdAt
        transactionCount
        serviceRequestCount
        supportMessageCount
      }
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!, $phone: String!, $newPassword: String!) {
    forgotPassword(email: $email, phone: $phone, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const SUPPORT_MESSAGES_QUERY = gql`
  query SupportMessages($limit: Int, $status: String, $category: String) {
    supportMessages(limit: $limit, status: $status, category: $category) {
      id
      subject
      message
      category
      senderRole
      senderName
      preferredChannel
      contactHandle
      status
      createdAt
      updatedAt
      user {
        id
        name
        phone
        email
        profilePicture
        telegramUsername
      }
    }
  }
`;

export const SEND_SUPPORT_MESSAGE_MUTATION = gql`
  mutation SendSupportMessage($input: SupportMessageInput!) {
    sendSupportMessage(input: $input) {
      success
      message
      supportMessage {
        id
        subject
        message
        category
        senderRole
        senderName
        preferredChannel
        contactHandle
        status
        createdAt
        updatedAt
        user {
          id
          name
          phone
          email
          profilePicture
          telegramUsername
        }
      }
    }
  }
`;

export const ADMIN_REPLY_SUPPORT_MESSAGE_MUTATION = gql`
  mutation AdminReplySupportMessage($userId: ID!, $input: AdminReplyInput!) {
    adminReplySupportMessage(userId: $userId, input: $input) {
      success
      message
      supportMessage {
        id
        subject
        message
        category
        senderRole
        senderName
        preferredChannel
        contactHandle
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($search: String) {
    adminUsers(search: $search) {
      id
      name
      phone
      email
      role
      walletBalance
      state
      address
      profilePicture
      telegramUsername
      createdAt
      transactionCount
      serviceRequestCount
      supportMessageCount
    }
  }
`;

export const ADMIN_USER_QUERY = gql`
  query AdminUser($id: ID!) {
    adminUser(id: $id) {
      user {
        id
        name
        phone
        email
        role
        walletBalance
        state
        address
        profilePicture
        telegramUsername
        createdAt
        transactionCount
        serviceRequestCount
        supportMessageCount
      }
      transactions {
        id
        service
        amount
        status
        type
        reference
        createdAt
      }
      serviceRequests {
        id
        category
        title
        provider
        accountOrPhone
        amount
        direction
        note
        status
        feePercentage
        expectedCredit
        createdAt
      }
      supportMessages {
        id
        subject
        message
        category
        senderRole
        senderName
        preferredChannel
        contactHandle
        status
        createdAt
        updatedAt
      }
    }
  }
`;

export const ADMIN_SUPPORT_MESSAGES_QUERY = gql`
  query AdminSupportMessages($limit: Int, $status: String, $category: String) {
    adminSupportMessages(limit: $limit, status: $status, category: $category) {
      id
      subject
      message
      category
      senderRole
      senderName
      preferredChannel
      contactHandle
      status
      createdAt
      updatedAt
      user {
        id
        name
        phone
        email
        profilePicture
        telegramUsername
      }
    }
  }
`;

export const UPDATE_SUPPORT_MESSAGE_STATUS_MUTATION = gql`
  mutation UpdateSupportMessageStatus($messageId: ID!, $status: String!) {
    updateSupportMessageStatus(messageId: $messageId, status: $status) {
      success
      message
      supportMessage {
        id
        status
        updatedAt
      }
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId) {
      success
      message
    }
  }
`;

export const ADMIN_SIGNUP = gql`
  mutation AdminSignup($input: AdminSignupInput!) {
    adminSignup(input: $input) {
      success
      message
      token
      user {
        id
        name
        phone
        email
        role
      }
    }
  }
`;

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
      success
      message
      token
      user {
        id
        name
        phone
        email
        role
      }
    }
  }
`;

