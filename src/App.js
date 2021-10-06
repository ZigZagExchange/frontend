import "./App.css";
import AppRoute from "./routes/AppRoute"
import AuthContextProvider from "./context/authContext";
import DataContextProvider from "./context/dataContext";

function App() {
    return (
        <>
            <AuthContextProvider>
                <DataContextProvider>
                <AppRoute/>
                </DataContextProvider>
            </AuthContextProvider>
        </>
    );
}

export default App;
