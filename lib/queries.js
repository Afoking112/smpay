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
        createdAt
      }
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

