import { Placement } from '@popperjs/core'
import React, { useRef } from 'react'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Card } from '../card'
import { useTransition, config, animated } from '@react-spring/web'
import { useClickAway } from 'react-use'

const PopoverContainer = styled(Card)`
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
`

const ReferenceElement = styled.div`
  display: flex;
`

export interface PopoverProps {
  content: React.ReactNode
  show: boolean
  onHide: () => void
  children: React.ReactNode
  placement?: Placement
  className?: string
  offsetX?: number
  offsetY?: number
}

export function Popover({ content, show, onHide, children }: PopoverProps) {
  const referenceRef = useRef<HTMLDivElement | null>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  })
  const transition = useTransition(show, {
    from: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.9 },
    config: { ...config.default, duration: 100 },
  })
  useClickAway(popperRef, onHide)

  return (
    <>
      <ReferenceElement ref={referenceRef}>{children}</ReferenceElement>
      {transition(
        (transitionStyles, item) =>
          item && (
            <animated.div style={{ ...styles.popper, ...transitionStyles }} ref={popperRef}>
              <PopoverContainer {...attributes.popper} clickable={false}>
                {content}
              </PopoverContainer>
            </animated.div>
          )
      )}
    </>
  )
}
