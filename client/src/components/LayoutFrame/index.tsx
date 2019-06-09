import * as React from 'react'
import { useState, useEffect } from 'react'
import { withStyles, Drawer, Divider, Hidden, Grid, List, ListItem, ClickAwayListener } from '@material-ui/core';
import WeidaiLogo from './WeidaiLogo'
import { UserSection } from './ActionPanel/UserSection'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { AdminSection } from './ActionPanel/AdminSection'
import { ContractSection } from './InfoPanel/ContractSection'
import { WalletSection } from './InfoPanel/WalletSection'
import { Detail, DetailProps } from './InfoPanel/Detail'
import Mobile from './ActionPanel/Mobile'
import API from '../../blockchain/ethereumAPI'

const actionWidth: number = 250
const infoWidth: number = 400

let styleObject = {
	root: {

	},
	actionDrawer: {
		width: actionWidth,
		flexShrink: 0,
	},
	infoDrawer: {
		width: infoWidth,
		flexShrink: 0,
	},
	actionDrawerPaper: {
		width: actionWidth
	},
	infoDrawerPaper: {
		width: infoWidth
	},
	content: {
		flexGrow: 1
	},
	heading: {
		fontSize: 40,
		fontFamily: 'Syncopate',
		margin: "10px 0 5px 0"
	},
	subheading: {
		fontSize: 16,
		margin: "0px 0 5px 0"
	},
	infoDivider: {
		margin: "25px 0 25px 0"
	},
	listItem: {
		display: "list-item"
	}
}

let styles = (theme: any) => styleObject


function LayoutFrameComponent(props: any) {

	const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(API.isMetaMaskConnected())
	const [metaMaskEnabled, setMetaMaskEnabled] = useState<boolean>(API.isMetaMaskEnabled())
	const [detailProps, setDetailProps] = useState<DetailProps>({ header: '', content: '' })
	const [detailVisibility, setDetailVisibility] = useState<boolean>(false)

	useEffect(() => {
		if (!metaMaskConnected || !metaMaskEnabled) {
			API.connectMetaMask().then(() => {
				setMetaMaskEnabled(API.isMetaMaskEnabled())
				setMetaMaskConnected(API.isMetaMaskConnected())
			})
		}
	})


	const { classes } = props

	const noMetamask = "METAMASK NOT ENABLED"
	const notConnected = "METAMASK NOT CONNECTED!"
	let error: any = null
	if (!metaMaskEnabled)
		error = noMetamask
	else if (!metaMaskConnected)
		error = notConnected

	return !!error ? error : (
		<div className={classes.root}>

			<Hidden mdDown>
				<Drawer variant="permanent"
					className={classes.actionDrawer}
					classes={{ paper: classes.actionDrawerPaper }}
				>
					<UserSection />
					<Divider />
					<AdminSection />
				</Drawer>
			</Hidden>
			<main className={classes.content}>
				<Mobile />
				<Grid
					container
					direction="row"
					justify="center"
					alignItems="center">
					<Grid item>
						<Grid
							container
							direction="column"
							justify="center"
							alignItems="center"
							spacing={0}>
							<Grid item>
								<Grid
									container
									direction="row"
									justify="space-evenly"
									alignItems="center"
									spacing={32}>
									<Grid item>
										<p className={classes.heading}>
											WEIDAI
												</p>
									</Grid>
									<Grid item>
										<WeidaiLogo />
									</Grid>
								</Grid>
							</Grid>
							<Grid item>
								<p className={classes.subheading}>
									THE WORLD'S FIRST THRIFTCOIN
									</p>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Divider variant="middle" />
				<Grid
					container
					justify="center"
					alignItems="stretch"
					direction="column">
					<Grid item>
						<Router>
							<Switch>
								<Route path="/" exact >
									Content
								</Route>
								<Route path="/engine">
									Patience Regulation Engine
								</Route>
								<Route path="/bank">
									Bank
								</Route>
							</Switch>
						</Router>
					</Grid>
				</Grid>

			</main>
			<Hidden mdDown>
				<ClickAwayListener onClickAway={() => setDetailVisibility(false)}>
					<Drawer variant="permanent" anchor="right"
						className={classes.infoDrawer}
						classes={{ paper: classes.infoDrawerPaper }}
					>
						<List>
							<ListItem className={classes.listItem}><WalletSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} /></ListItem>
							<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /></ListItem>
							<ListItem className={classes.listItem}><ContractSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} /></ListItem>
							<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /> </ListItem>
							<ListItem className={classes.listItem}>{detailVisibility ? <Detail {...detailProps} /> : ""}</ListItem>
						</List>
					</Drawer>
				</ClickAwayListener>
			</Hidden>
		</div>
	)
}


export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)