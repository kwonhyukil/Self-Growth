export interface User {
  id: number
  email: string
  name: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginBody {
  email: string
  password: string
}

export interface SignupBody {
  email: string
  password: string
  name: string
}
