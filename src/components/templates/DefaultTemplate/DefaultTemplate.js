import { Header } from 'components'

export const DefaultTemplate = ({ children }) => {
    return (
        <>
            <Header />
            {children}
        </>
    )
}