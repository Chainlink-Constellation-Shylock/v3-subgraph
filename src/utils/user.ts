import { ZERO_BD, ZERO_BI, ONE_BI } from './constants'
/* eslint-disable prefer-const */
import {
  Factory,
  Pool,
  Token,
  Bundle,
  Tick,
  User
} from '../../generated/schema'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent
} from '../../generated/templates/Pool/Pool'
import { BigDecimal } from '@graphprotocol/graph-ts'

/**
 * Tracks global User Historical Mint Data
 * @param event
 */
export function updateUserMintData(event: MintEvent): User {
  let userAddress = event.params.owner.toHexString()
  let user = User.load(userAddress)
  let timestamp = event.block.timestamp
  if (user === null) {
    user = new User(userAddress)
    user.volumeETH = ZERO_BD
    user.volumeUSD = ZERO_BD
    user.volumeUSDUntracked = ZERO_BD
    user.lastBurn = ZERO_BI
    user.txCount = ZERO_BI
    user.twLiqUSD = ZERO_BD
  }
  user.txCount = user.txCount.plus(ONE_BI)
  user.lastMint = timestamp
  user.save()
  return user as User
}

/**
 * Tracks global User Historical Burn Data
 * @param event
 */
export function updateUserBurnData(event: BurnEvent, amountUSD: BigDecimal): User {
  let userAddress = event.params.owner.toHexString()
  let user = User.load(userAddress)
  let timestamp = event.block.timestamp
  if (user === null) {
    user = new User(userAddress)
    user.volumeETH = ZERO_BD
    user.volumeUSD = ZERO_BD
    user.volumeUSDUntracked = ZERO_BD
    user.txCount = ZERO_BI
    user.lastMint = ZERO_BI
    user.lastBurn = ZERO_BI 
    user.twLiqUSD = ZERO_BD
  } else {
    user.lastBurn = timestamp
    let timeDiff = timestamp.minus(user.lastMint).toBigDecimal()
    user.twLiqUSD = user.twLiqUSD.plus(amountUSD.times(timeDiff))
  }
  user.txCount = user.txCount.plus(ONE_BI)
  user.save()
  return user as User
}

/**
 * Tracks global User Historical Swap Data
 */
export function updateUserSwapData(
  event: SwapEvent,
  amountTotalUSDTracked: BigDecimal,
  amountTotalETHTracked: BigDecimal,
  amountTotalUSDUntracked: BigDecimal
): User {
  let userAddress = event.params.sender.toHexString()
  let user = User.load(userAddress)
  if (user === null) {
    user = new User(userAddress)
    user.volumeETH = ZERO_BD
    user.volumeUSD = ZERO_BD
    user.volumeUSDUntracked = ZERO_BD
    user.txCount = ZERO_BI
    user.lastMint = ZERO_BI
    user.lastBurn = ZERO_BI
    user.twLiqUSD = ZERO_BD
  }
  user.volumeETH = user.volumeETH.plus(amountTotalETHTracked)
  user.volumeUSD = user.volumeUSD.plus(amountTotalUSDTracked)
  user.volumeUSDUntracked = user.volumeUSDUntracked.plus(amountTotalUSDUntracked)
  user.txCount = user.txCount.plus(ONE_BI)
  user.save()
  return user as User
}