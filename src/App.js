import "./App.css";
import AppRoute from "./routes/AppRoute"
import AuthContextProvider from "./context/authContext";

function App() {
    return (
        <>
            <AuthContextProvider>
                <AppRoute/>
            </AuthContextProvider>
        </>
    );
}

export default App;
