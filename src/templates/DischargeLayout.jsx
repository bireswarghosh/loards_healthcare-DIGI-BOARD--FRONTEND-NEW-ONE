import React from 'react'
import { Outlet } from 'react-router-dom'
import DischargeNav from './DischargeNav'

const DischargeLayout = () => {
  return (
    <div>
      <DischargeNav />
      <Outlet/>
    </div>
  )
}

export default DischargeLayout