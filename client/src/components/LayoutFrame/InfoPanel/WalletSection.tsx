import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from './Common'
import Edit from '@material-ui/icons/Edit'
import FormDialog from '../../Common/FormDialog'
import API from '../../../blockchain/ethereumAPI'
import * as storage from '../../../util/HTML5'
import { truncate } from '../../../util/jsHelpers'
import {DetailProps} from './Detail'
import {ClickAbleInfoListItem} from './Common'

const textStyle = (theme: any) => ({
	text: {
		fontSize: 12,
		fontFamily: "Syncopate",
		margin: "0 0 0 0",
	},
	button: {
		paddingTop: 0,
		paddingBottom: 0
	}
})

export interface WalletProps {
	setDetailProps: (props: DetailProps) => void
	setDetailVisibility: (visible:boolean) =>void
	classes?: any
}

function WalletSectionComponent(props: WalletProps) {
	const classes = props.classes
	const [walletAddress, setWalletAddress] = useState<string>("0x0")
	const [weiDaiBalance, setWeiDaiBalance] = useState<string>("unset")
	const [daiBalance, setDaiBalance] = useState<string>("unset")
	const [incubatingWeiDai, setIncubatingWeiDai] = useState<string>("unset")
	const [editingFriendly, setEditingFriendly] = useState<boolean>(false)
	const [friendlyText, setFriendlyText] = useState<string>(storage.loadFriendlyName(walletAddress))

	useEffect(() => {
		const subscription = API.accountObservable.subscribe(account => {
			if (walletAddress !== account)
				setFriendlyText(storage.loadFriendlyName(account))
			setWalletAddress(account)
		})

		return function () {
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.weiDaiEffects.balanceOfEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setWeiDaiBalance(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.daiEffects.balanceOfEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setDaiBalance(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.preEffects.incubatingWeiDaiEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setIncubatingWeiDai(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	const updateFriendly = () => {
		if (friendlyText.length == 0)
			return
		storage.setFriendlyName(walletAddress, friendlyText)
		setEditingFriendly(false)
	}

	return (
		<div>
			<FormDialog
				fieldNames={['Friendly Name']}
				submit={updateFriendly}
				close={() => setEditingFriendly(false)}
				fieldUpdate={[setFriendlyText]}
				validationErrors={[]}
				message='stored locally only'
				title='Set Friendly Name for Account'
				isOpen={editingFriendly}
				fieldText={[friendlyText]}
			></FormDialog>
			{getList(classes,props.setDetailProps,props.setDetailVisibility, walletAddress, storage.loadFriendlyName(walletAddress), daiBalance, weiDaiBalance, incubatingWeiDai, setEditingFriendly)}
		</div>
	)
}

function getList(classes: any,setDetailProps:(props:DetailProps)=>void,setDetailVisibility:(props:boolean)=>void, walletAddress: string, friendly: string, daiBalance: string, weiDaiBalance: string, incubatingWeiDai: string, pencilClick: (editing: boolean) => void) {
	return (
		<List>
			<ListItem button>
				{getLine(classes, "Wallet Address", `${truncate(walletAddress)}`)}
			</ListItem>
			<ListItem button>
				{getLine(classes, "Friendly", friendly, false, <IconButton onClick={() => pencilClick(true)} className={classes.button}><Edit fontSize="small" /></IconButton>)}
			</ListItem>
			<ClickAbleInfoListItem details={daiBalanceDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "Dai Balance", daiBalance)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={weiDaiBalanceDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "WeiDai Balance", weiDaiBalance)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={incubatingWeiDaiDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "Incubating WeiDai", incubatingWeiDai)}
			</ClickAbleInfoListItem>
		</List>
	)
}


function getLine(classes: any, label: string, detail: number | string, percentage: boolean = false, icon: any | undefined = undefined) {
	const paragraph = themedText(classes)
	return (
		<Grid
			container
			direction="row"
			justify="space-between"
			alignItems="center"
		>
			<Grid item>
				{paragraph(label)}
			</Grid>
			<Grid item>
				{paragraph(detail, percentage, icon)}
			</Grid>
		</Grid>
	)
}

const daiBalanceDetails: DetailProps = {
	header: "Dai Balance",
	content: "To create WeiDai, you need to first own some Dai, an ERC20 token known as a stablecoin because it tracks the US Dollar. Unlike early renditions of stable coins, Dai is managed entirely on the Ethereum blockchain by the MakerDAO and is 100% decentralized, inheriting the censorship resistance of ethereum transactions.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

const weiDaiBalanceDetails: DetailProps = {
	header: "WeiDai Balance",
	content: "WeiDai is the world's first thriftcoin, a stablecoin designed to increase in value while retaining price stability. WeiDai is redeemable for Dai according to a global redeem rate. Whenever circulating WeiDai is burnt, the redeem rate increases. Two mechanisms exist to encourage regular burning so that the redeem rate regularly increases. The redeem rate can never fall.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

const incubatingWeiDaiDetails: DetailProps = {
	header: "Incubating WeiDai",
	content: "To create WeiDai, you send your Dai to the Patience Regulation Engine, an Ethereum smart contract that incubates your Dai until it becomes WeiDai. If you prematurely attempt to withdraw your incubating WeiDai, it will be slashed with a penalty. Once the WeiDai has incubated entirely, you have to withdraw it from the Patience Regulation Engine to use it.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

export const WalletSection = withStyles(textStyle)(WalletSectionComponent)