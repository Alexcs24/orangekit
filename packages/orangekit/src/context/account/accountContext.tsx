import * as React from "react"

import { Account, IAccountContext } from "../../types/account"
import { IWalletContext, Wallet } from "../../types/wallet"
import { useToast } from "../../components/ui/use-toast"
import { WalletContext } from "../wallet/walletContext"

export const AccountContext = React.createContext<IAccountContext | null>(null)

const AccountProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { connectedWallet, disconnectWallet, connectWallet } = React.useContext(
		WalletContext
	) as IWalletContext

	const [account, setAccount] = React.useState<Account>({
		connected: false,
		address: null,
		network: null,
		balance: 0,
		authenticated: false,
	})

	const { toast } = useToast()

	const connect = async (wallet: Wallet) => {
		try {
			const accounts = await wallet.requestAccounts()
			if (!accounts[0]) {
				toast({
					variant: "destructive",
					title: "Connection failed",
					description: `Error: ${"No account found"}`,
				})
				return
			}
			await connectWallet(wallet)
			setAccount({
				connected: true,
				address: accounts[0],
				network: null,
				balance: await wallet.getBalance(),
				authenticated: false,
			})
			window.localStorage.setItem(
				"account",
				JSON.stringify({
					connected: true,
					address: accounts[0],
					network: null,
					balance: await wallet.getBalance(),
					authenticated: false,
				})
			)
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Connection failed",
				description: `Error: ${error.message ? error.message : error}`,
			})
		}
	}

	const disconnect = async () => {
		try {
			if (!connectedWallet) {
				toast({
					variant: "destructive",
					title: "Disconnect failed",
					description: "No wallet connected",
				})
				return
			}
			disconnectWallet()
			setAccount({
				connected: false,
				address: null,
				network: null,
				balance: 0,
				authenticated: false,
			})
			window.localStorage.setItem(
				"account",
				JSON.stringify({
					connected: false,
					address: null,
					network: null,
					balance: 0,
					authenticated: false,
				})
			)
		} catch (error) {
			console.log(error)
		}
	}

	const authenticate = async () => {
		setAccount({
			...account,
			authenticated: true,
		})
	}

	React.useEffect(() => {
		setAccount(
			window.localStorage.getItem("account")
				? JSON.parse(localStorage.getItem("account") as string)
				: {
						connected: false,
						address: null,
						network: null,
						balance: 0,
						authenticated: false,
				  }
		)
	}, [])

	return (
		<AccountContext.Provider
			value={{
				connect,
				disconnect,
				account,
				authenticate,
			}}
		>
			{children}
		</AccountContext.Provider>
	)
}

export default AccountProvider