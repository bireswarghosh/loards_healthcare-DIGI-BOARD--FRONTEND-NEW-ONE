import React, { useState, useEffect } from 'react'
import CountUp from 'react-countup'
import axiosInstance from '../../axiosInstance'
import socket from '../../socketClient'

const CrmDashboardCards = () => {
  const [allDoctors, setAllDoctors] = useState(0)
  const [activeDoctors, setActiveDoctors] = useState(0)

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [allRes, activeRes] = await Promise.all([
          axiosInstance.get('/doctormaster'),
          axiosInstance.get('/doctormaster/active')
        ])
        setAllDoctors(allRes.data.total || 0)
        setActiveDoctors(activeRes.data.total || 0)
      } catch (error) {
        console.error('Error fetching doctors:', error)
      }
    }

    fetchInitialData()

    // Listen for live updates
    socket.on('doctormaster:list', (data) => {
      console.log('📡 All doctors updated:', data)
      setAllDoctors(data.total || 0)
    })

    socket.on('doctormaster:active', (data) => {
      console.log('📡 Active doctors updated:', data)
      setActiveDoctors(data.total || 0)
    })

    socket.on('doctormaster:active:update', (data) => {
      console.log('📡 Active doctors status changed:', data)
      setActiveDoctors(data.total || 0)
    })

    return () => {
      socket.off('doctormaster:list')
      socket.off('doctormaster:active')
      socket.off('doctormaster:active:update')
    }
  }, [])

  return (
    <div className="row mb-30">
        <div className="col-lg-3 col-6 col-xs-12">
            <div className="dashboard-top-box d-block rounded border-0 panel-bg">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div className="right">
                        <div className="part-icon text-light rounded">
                            <span><i className="fa-light fa-user-doctor"></i></span>
                        </div>
                    </div>
                    <div className="left">
                        <h3 className="fw-normal"><CountUp end={allDoctors}/></h3>
                    </div>
                </div>
                <div className="progress-box">
                    <p className="d-flex justify-content-between mb-1">All Doctors <small>Live</small></p>
                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar bg-success" style={{width:'75%'}}></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-lg-3 col-6 col-xs-12">
            <div className="dashboard-top-box d-block rounded border-0 panel-bg">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div className="right">
                        <div className="part-icon text-light rounded">
                            <span><i className="fa-light fa-user-check"></i></span>
                        </div>
                    </div>
                    <div className="left">
                        <h3 className="fw-normal"><CountUp end={activeDoctors}/></h3>
                    </div>
                </div>
                <div className="progress-box">
                    <p className="d-flex justify-content-between mb-1">Active Doctors <small>Live</small></p>
                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar bg-primary" style={{width:'75%'}}></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-lg-3 col-6 col-xs-12">
            <div className="dashboard-top-box d-block rounded border-0 panel-bg">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div className="right">
                        <div className="part-icon text-light rounded">
                            <span><i className="fa-light fa-money-bill"></i></span>
                        </div>
                    </div>
                    <div className="left">
                        <h3 className="fw-normal">$<CountUp end={254317}/></h3>
                    </div>
                </div>
                <div className="progress-box">
                    <p className="d-flex justify-content-between mb-1">Total Expenses <small>+16.24%</small></p>
                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar bg-warning" style={{width:'75%'}}></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="col-lg-3 col-6 col-xs-12">
            <div className="dashboard-top-box d-block rounded border-0 panel-bg">
                <div className="d-flex justify-content-between align-items-center mb-20">
                    <div className="right">
                        <div className="part-icon text-light rounded">
                            <span><i className="fa-light fa-file"></i></span>
                        </div>
                    </div>
                    <div className="left">
                        <h3 className="fw-normal"><CountUp end={1341}/></h3>
                    </div>
                </div>
                <div className="progress-box">
                    <p className="d-flex justify-content-between mb-1">Running Projects <small>+16.24%</small></p>
                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
                        <div className="progress-bar bg-danger" style={{width:'75%'}}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CrmDashboardCards