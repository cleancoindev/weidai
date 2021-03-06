import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { withStyles, Grid, Typography, Box, Button, Divider } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import { formatDecimalStrings, formatNumberText, isLoaded } from '../../util/jsHelpers'
import { ValueTextBox } from '../Common/ValueTextBox';
import { Loading } from '../Common/Loading'
import { WalletContext } from '../Contexts/WalletStatusContext'
interface bankProps {
	classes?: any
}

const style = (theme: any) => ({
	pageSplit: {
		margin: "20px"
	}
})

function BankComponent(props: bankProps) {
	const [weiDaiBalance, setWeiDaiBalance] = useState<string>('unset')
	const [reserveDai, setReserveDai] = useState<string>('unset')
	const [weiDaiToRedeem, setWeiDaiToRedeem] = useState<string>('')
	const [daiToBeRedeemed, setDaiToBeRedeemed] = useState<string>('')
	const [exchangeRate, setExchangeRate] = useState<number>(0)
	const [weiDaiEnabled, setWeiDaiEnabled] = useState<boolean>(false)
	const [loaded, setLoaded] = useState<boolean>(false)
	const [priorWeiDaiBalance, setPriorWeiDaiBalance] = useState<string>('unset')
	const [totalWeiDai, setTotalWeiDai] = useState<string>('unset')
	const [totalWeiDaiNum, setTotalWeiDaiNum] = useState<number>(0)
	const walletContextProps = useContext(WalletContext)

	useEffect(() => {
		const effect = API.weiDaiEffects.balanceOfEffect(walletContextProps.account)
		const subscription = effect.Observable.subscribe((balance) => {

			if (priorWeiDaiBalance !== balance) {
				setWeiDaiBalance(formatDecimalStrings(balance))
				setPriorWeiDaiBalance(balance)
				setWeiDaiToRedeemText("")
			}
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.weiDaiEffects.totalSupplyEffect()
		const subscription = effect.Observable.subscribe((balance) => {
			const balanceNum = parseFloat(balance);
			setTotalWeiDaiNum(isNaN(balanceNum) ? 0 : balanceNum)
			setTotalWeiDai(formatDecimalStrings(balance))
		})

		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.bankEffects.daiPerMyriadWeidaiEffect()
		const subscription = effect.Observable.subscribe((daiPerMyriadWeiDai: string) => {
			const daiPerMyriadWeiDaiNum = parseFloat(daiPerMyriadWeiDai)
			const daiInReserve = daiPerMyriadWeiDaiNum * totalWeiDaiNum / 10000;
			setReserveDai(formatDecimalStrings(`${daiInReserve}`))
			setExchangeRate(daiPerMyriadWeiDaiNum)
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
			const effect = API.weiDaiEffects.allowance(walletContextProps.account, walletContextProps.contracts.WeiDaiBank.address)
			const subscription = effect.Observable.subscribe((allowance) => {
				let ethScaledAllowance = parseFloat(API.fromWei(allowance))
				const weiDaiBalanceFloat = parseFloat(weiDaiBalance)
				const nan: boolean = isNaN(ethScaledAllowance) || isNaN(weiDaiBalanceFloat)
				setWeiDaiEnabled(!nan && ethScaledAllowance > weiDaiBalanceFloat)
			})
			return () => { subscription.unsubscribe(); effect.cleanup() }
	})


	useEffect(() => {
		setLoaded(isLoaded([weiDaiBalance, reserveDai]))
	}, [reserveDai, weiDaiBalance])

	const setWeiDaiToRedeemText = (text: string) => {
		const newText = formatNumberText(text)
		const newTextNum = parseFloat(newText)
		const weiDaiBalanceNum = parseFloat(weiDaiBalance)
		const cappedText = newTextNum > weiDaiBalanceNum ? weiDaiBalance : newText

		setWeiDaiToRedeem(cappedText)
		const daiToRedeem = (parseFloat(cappedText) * 0.98 * exchangeRate) / 10000

		setDaiToBeRedeemed(`${isNaN(daiToRedeem) ? '' : daiToRedeem}`)
	}

	if (!loaded)
		return <Loading />

	if (parseFloat(weiDaiBalance) == 0) {
		return <div>
			<Grid
				container
				direction="column"
				justify="flex-start"
				alignItems="center"
				spacing={0}>
				<Grid item>
					<Grid
						container
						direction="row"
						justify="flex-start"
						alignItems="center"
						spacing={8}>
						<Grid item>
							<Typography variant="h5">
								You currently do not own WeiDai
					</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Typography variant="h6">
						Consider creating some using the Patience Regulation Engine by clicking Create/Claim
				</Typography>
				</Grid>
			</Grid>
		</div>
	}
	return <div className={props.classes.root}>
		<Grid
			container
			direction="column"
			justify="flex-start"
			alignItems="center"
			spacing={0}>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={4}
					alignItems="center">
					<Grid item>
						<Typography variant="h5">
							Global WeiDai Supply
					</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h5">
							{totalWeiDai}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={4}
					alignItems="center">
					<Grid item>
						<Typography variant="h5">
							Dai held in reserve
					</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h5">
							{reserveDai}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid>
				<Divider className={props.classes.pageSplit} />
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={4}
					alignItems="center">
					<Grid item>
						<Typography variant="h6">
							Your WeiDai balance
					</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h6">
							{weiDaiBalance}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="column"
					justify="space-around"
					spacing={3}
					alignItems="center">
					<Grid item>
						<ValueTextBox text={weiDaiToRedeem} placeholder="WeiDai" changeText={setWeiDaiToRedeemText} entireAction={() => setWeiDaiToRedeemText(weiDaiBalance)} />
					</Grid>
					<Grid item>

						<Box component="div">
							<Typography variant="subtitle1">
								can redeem
						</Typography>
						</Box>
					</Grid>
					<Grid item>
						<Box component="div">
							<Typography variant="h6">
								{daiToBeRedeemed.length == 0 ? 0 : daiToBeRedeemed} Dai
							</Typography>
						</Box>
					</Grid>
					<Grid item>
						&nbsp;
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid
					container
					direction="column"
					justify="flex-start"
					alignItems="center"
					spacing={0}>
					<Grid item>
						{weiDaiEnabled ?
							<Button variant="contained" color="primary" onClick={async () => {
								if (isNaN(parseFloat(weiDaiToRedeem)))
									return
								let unscaledWeiDai = API.toWei(weiDaiToRedeem)
								await walletContextProps.contracts.WeiDaiBank.redeemWeiDai(unscaledWeiDai).send({ from: walletContextProps.account })

							}}>Redeem</Button> :
							<Button variant="contained" color="secondary" onClick={async () => {
								await walletContextProps.contracts.WeiDai.approve(walletContextProps.contracts.WeiDaiBank.address, API.UINTMAX).send({ from: walletContextProps.account })
							}}>Enable WeiDai
						</Button>}
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	</div>
}

export default withStyles(style)(BankComponent)