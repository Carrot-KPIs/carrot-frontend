import { useEffect, useState } from 'react'
import { FEATURED_CAMPAIGNS } from '../constants'
import { KpiToken, Amount, Token } from '@carrot-kpi/sdk'
import { gql, useQuery } from '@apollo/client'
import { useCarrotSubgraphClient } from './useCarrotSubgraphClient'
import { BigNumber } from '@ethersproject/bignumber'
import { DateTime } from 'luxon'
import { useActiveWeb3React } from './useActiveWeb3React'
import { getAddress } from '@ethersproject/address'

const FEATURED_KPI_TOKENS_QUERY = gql`
  query kpiTokens($ids: [ID!]!) {
    kpiTokens(where: { id_in: $ids }) {
      id
      fee
      symbol
      name
      kpiId
      totalSupply
      oracle
      lowerBound
      higherBound
      finalProgress
      finalized
      kpiReached
      creator
      expiresAt
      oracleQuestion {
        text
      }
      collateral {
        token {
          id
          symbol
          name
          decimals
        }
        amount
      }
    }
  }
`

interface CarrotQueryResult {
  kpiTokens: {
    id: string
    fee: string
    symbol: string
    name: string
    kpiId: string
    expiresAt: string
    totalSupply: string
    oracle: string
    lowerBound: string
    higherBound: string
    finalProgress: string
    oracleQuestion: { text: string }
    finalized: boolean
    kpiReached: boolean
    creator: string
    collateral: {
      token: {
        id: string
        symbol: string
        name: string
        decimals: number
      }
      amount: string
    }
  }[]
}

export function useFeaturedKpiTokens() {
  const { chainId } = useActiveWeb3React()
  const carrotSubgraphClient = useCarrotSubgraphClient()
  const { data: featuredKpiTokensData, loading: featuredKpiTokensLoading } = useQuery<CarrotQueryResult>(
    FEATURED_KPI_TOKENS_QUERY,
    {
      variables: { ids: chainId && FEATURED_CAMPAIGNS[chainId].map((campaign) => campaign.id) },
      client: carrotSubgraphClient,
    }
  )

  const [featuredKpiTokens, setFeaturedKpiTokens] = useState<KpiToken[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!chainId) return
    if (featuredKpiTokensLoading || !featuredKpiTokensData) {
      setLoading(true)
      setFeaturedKpiTokens([])
      return
    }
    const featuredKpiTokens = featuredKpiTokensData.kpiTokens.map((kpiToken) => {
      const collateralToken = new Token(
        chainId,
        getAddress(kpiToken.collateral.token.id),
        kpiToken.collateral.token.decimals,
        kpiToken.collateral.token.symbol,
        kpiToken.collateral.token.name
      )
      return new KpiToken(
        chainId,
        getAddress(kpiToken.id),
        kpiToken.symbol,
        kpiToken.name,
        kpiToken.kpiId,
        BigNumber.from(kpiToken.totalSupply),
        kpiToken.oracle,
        kpiToken.oracleQuestion.text,
        BigNumber.from(kpiToken.lowerBound),
        BigNumber.from(kpiToken.higherBound),
        BigNumber.from(kpiToken.finalProgress),
        DateTime.fromSeconds(parseInt(kpiToken.expiresAt)),
        kpiToken.finalized,
        kpiToken.kpiReached,
        kpiToken.creator,
        new Amount<Token>(collateralToken, BigNumber.from(kpiToken.collateral.amount)),
        new Amount<Token>(collateralToken, BigNumber.from(kpiToken.fee))
      )
    })
    setFeaturedKpiTokens(featuredKpiTokens)
    setLoading(false)
  }, [chainId, featuredKpiTokensData, featuredKpiTokensLoading])

  return { loading, featuredKpiTokens }
}
