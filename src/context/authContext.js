import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext({});

const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const updateUser = (user) => {
        setUser(user);
    }
    return (
        <AuthContext.Provider value={{user,updateUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => useContext(AuthContext);

export default AuthContextProvider;