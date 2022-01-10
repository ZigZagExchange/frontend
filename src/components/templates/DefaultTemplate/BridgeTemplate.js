import { Header } from 'components'
// import { HeaderBridge } from 'components'
export const BridgeTemplate = ({ children }) => {
    return (
        <>
            <Header />
            <div className='template_wrapper'>
                {children}
            </div>
        </>
    )
}