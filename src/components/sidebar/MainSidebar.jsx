import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DigiContext } from '../../context/DigiContext';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import DashboardPart from './DashboardPart';
import AppsPart from './AppsPart';
import PagesPart from './PagesPart';
import ComponentsPart from './ComponentsPart';
import OutDoor from './OutDoor';
import IndoorMaster from './IndoorMaster';
import Indoor from './Indoor';
import OutdoorMaster from './OutdoorMaster';
import DiagnosisMaster from './DiagnosisMaster';
import BookingApp from './BookingApp';
import Marketing from './Marketing';
const MainSidebar = () => {
  const {
    isExpanded,
    sidebarBackgroundImageStyle,
    isNavExpanded,
    layoutPosition,
    isSidebarOpen,
    ref,
    handleNavHover,
    handleNavHoverEnd,
    isSmallScreen,
  } = useContext(DigiContext);

  const shouldUseOverlayScrollbars = isExpanded || !isNavExpanded.isSmall || layoutPosition.horizontal || (!layoutPosition.twoColumn && isExpanded) || !layoutPosition.flush;

  return (
    <div
      className={`main-sidebar 
      ${
        isNavExpanded.isSmall && !isExpanded ? 'collapsed' : isExpanded && isNavExpanded.reset ? 'collapsed' : ''
      } ${
        isNavExpanded.reset && isExpanded ? 'reset' : ''
      } ${
        layoutPosition.horizontal? 'open-sub horizontal-menu': ''
      } ${
        isSidebarOpen && !layoutPosition.twoColumn
          ? 'sidebar-mini'
          : 'vertical-menu'
      }
      ${
        !isSidebarOpen && layoutPosition.twoColumn && isSmallScreen
          ? 'sub-menu-collapsed'
          : ''
      }
        ${
        layoutPosition.twoColumn  ? 'two-column-menu collapsed':''
      } ${
        layoutPosition.twoColumn && isExpanded && !isSmallScreen ? 'sub-menu-collapsed':''
      } ${
        isNavExpanded.hoverOpen && isNavExpanded.hover ? 'sidebar-hover hoverable':''
      } ${
        layoutPosition.flush? 'flush-menu':''
      } 
      `}
      style={sidebarBackgroundImageStyle}
      ref={ref}
      onMouseEnter={isNavExpanded.hover ? handleNavHover : undefined}
      onMouseLeave={isNavExpanded.hover ? handleNavHoverEnd : undefined}
    >
      <div className="main-menu">
        {shouldUseOverlayScrollbars ? (
          <OverlayScrollbarsComponent className="sidebar-menu">
            <DashboardPart />
           
            <OutDoor />
            
<OutdoorMaster/>
            <Indoor />
          <IndoorMaster/>


            <DiagnosisMaster/>
            <BookingApp/>
            <Marketing/>
            
            




            <li className="help-center">
              <h3>Help Center</h3>
              <p>We're an award-winning, forward thinking</p>
              <a href="https://www.appstrice.com/" className="btn btn-sm btn-light" target="_blank" rel="noopener noreferrer">
                Go to Help Center
              </a>
            </li>
          </OverlayScrollbarsComponent>
        ) : (
          <>
            <DashboardPart />
           

            <OutDoor />
            
<OutdoorMaster/>
                  <Indoor />


          <IndoorMaster/>


          <DiagnosisMaster/>
            <BookingApp/>

 <Marketing/>



            <li className="help-center">
              <h3>Help Center</h3>
              <p>We're an award-winning, forward thinking</p>
              <a href="https://www.appstrice.com/" className="btn btn-sm btn-light" target="_blank" rel="noopener noreferrer">
                Go to Help Center
              </a>
            </li>
          </>
        )}
      </div>
    </div>
  );
};

export default MainSidebar;
