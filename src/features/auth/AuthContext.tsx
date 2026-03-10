// src/features/auth/AuthContext.tsx
import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { AuthReducer, initialState } from './authReducer';
import type { AuthState, AuthAction } from './authReducer';
interface AuthContextType {
 state: AuthState;
 dispatch: React.Dispatch<AuthAction>;
}
const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
 const [state, dispatch] = useReducer(AuthReducer, initialState);
 return (
 <AuthContext.Provider value={{ state, dispatch }}>
 {children}
 </AuthContext.Provider>
 );
}
// Custom hook pour consommer le context
export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth doit être utilisé dans un AuthProvider');
 }
 return context;
}