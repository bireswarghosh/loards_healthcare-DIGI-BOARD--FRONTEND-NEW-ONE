import { NavLink, Link } from 'react-router-dom';
import { useContext } from 'react';
import { DigiContext } from '../../context/DigiContext';

const PagesPart = () => {
  const {
    pagesState,
    toggleMainPagesDropdown,
    toggleSubPagesDropdown,
    toggleAuthentication,
    toggleError,
    toggleUser,
    layoutPosition,
    dropdownOpen,
    mainPagesRef,
    isExpanded,
    isNavExpanded,
    isSmallScreen,
    toggleAdditional
  } = useContext(DigiContext);
  const { 
    isMainDropdownOpen, 
    isSubDropdownOpen, 
    authentication, 
    user, 
    error,
    additional 
  } = pagesState;
  const handleSubNavLinkClick = () => {
    if (!isSubDropdownOpen) {
      toggleSubPagesDropdown(); // Open the sub-dropdown
    }
  };
  return (
    <li className="sidebar-item" ref={isExpanded || isNavExpanded.isSmall || layoutPosition.horizontal || (layoutPosition.twoColumn && isExpanded) || (layoutPosition.twoColumn && isSmallScreen) ? mainPagesRef : null}>
      <Link
        role="button"
        className={`sidebar-link-group-title has-sub ${isMainDropdownOpen ? 'show' : ''}`}
        onClick={toggleMainPagesDropdown}
      >
        Pages
      </Link>
      <ul className={`sidebar-link-group ${layoutPosition.horizontal ? (dropdownOpen.pages ? 'd-block' : '') : (isMainDropdownOpen ? 'd-none' : '')}`}>       
        <li className="sidebar-dropdown-item">
          <Link
            role="button"
            className={`sidebar-link has-sub ${authentication ? 'show' : ''}`}
            onClick={toggleAuthentication}
          >
            <span className="nav-icon">
              <i className="fa-light fa-user-cog"></i>
            </span>{' '}
            <span className="sidebar-txt">Authentication</span>
          </Link>
          <ul className={`sidebar-dropdown-menu ${authentication ? 'd-block' : ''}`}>
            <li className="sidebar-dropdown-item">
              <NavLink to="/login" className="sidebar-link">
                Login 01
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/login2" className="sidebar-link">
                Login 02
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/login3" className="sidebar-link">
                Login 03
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/registration" className="sidebar-link">
                Registration 01
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/registration2" className="sidebar-link">
                Registration 02
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/resetPassword" className="sidebar-link">
                Reset Password
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/updatePassword" className="sidebar-link">
                Update Password
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/loginStatus" className="sidebar-link">
                Login Status
              </NavLink>
            </li>
          </ul>
        </li>
        <li className="sidebar-dropdown-item">
          <Link
            role="button"
            className={`sidebar-link has-sub ${error ? 'show' : ''}`}
            onClick={toggleError}
          >
            <span className="nav-icon">
              <i className="fa-light fa-triangle-exclamation"></i>
            </span>{' '}
            <span className="sidebar-txt">Error</span>
          </Link>
          <ul className={`sidebar-dropdown-menu ${error ? 'd-block' : ''}`}>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error400" className="sidebar-link">
                Error 400
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error403" className="sidebar-link">
                Error 403
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error404" className="sidebar-link">
                Error 404
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error408" className="sidebar-link">
                Error 408
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error500" className="sidebar-link">
                Error 500
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error503" className="sidebar-link">
                Error 503
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/error504" className="sidebar-link">
                Error 504
              </NavLink>
            </li>
          </ul>
        </li>
        <li className="sidebar-dropdown-item">
          <Link
            role="button"
            className={`sidebar-link has-sub ${user ? 'show' : ''}`}
            onClick={toggleUser}
          >
            <span className="nav-icon">
              <i className="fa-light fa-user"></i>
            </span>{' '}
            <span className="sidebar-txt">User</span>
          </Link>
          <ul className={`sidebar-dropdown-menu ${user ? 'd-block' : ''}`}>
            <li className="sidebar-dropdown-item">
              <NavLink to="/profile" className="sidebar-link" onClick={handleSubNavLinkClick}>
                View Profile
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/editProfile" className="sidebar-link" onClick={handleSubNavLinkClick}>
                Edit Profile
              </NavLink>
            </li>
          </ul>
        </li>
        <li className="sidebar-dropdown-item">
          <Link
            role="button"
            className={`sidebar-link has-sub ${additional ? 'show' : ''}`}
            onClick={toggleAdditional}
          >
            <span className="nav-icon">
              <i className="fa-light fa-square-plus"></i>
            </span>{' '}
            <span className="sidebar-txt">Additional</span>
          </Link>
          <ul className={`sidebar-dropdown-menu ${additional ? 'd-block' : ''}`}>
            <li className="sidebar-dropdown-item">
              <NavLink to="/comingSoon" className="sidebar-link">
              Coming Soon 01
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/comingSoon2" className="sidebar-link">
              Coming Soon 02
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/pricingTable" className="sidebar-link">
              Pricing Table 01
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/pricingTable2" className="sidebar-link">
              Pricing Table 02
              </NavLink>
            </li>
            <li className="sidebar-dropdown-item">
              <NavLink to="/underConstruction" className="sidebar-link">
              Under Construction
              </NavLink>
            </li>
          </ul>
        </li>
        <li className="sidebar-dropdown-item">
          <NavLink to="/utility" className="sidebar-link">
            <span className="nav-icon">
              <i className="fa-light fa-layer-group"></i>
            </span>{' '}
            <span className="sidebar-txt">Utility</span>
          </NavLink>
        </li>
      </ul>
    </li>
  );
};

export default PagesPart;
