import {
  BsBarChartLine,
  BsCollection,
  BsEnvelope,
  BsExclamationTriangle,
  BsFileText,
  BsGeoAlt,
  BsGlobe2,
  BsImage,
  BsListCheck,
  BsPersonDash,
  BsPower,
  BsStars,
  BsTelephone,
  BsThreeDotsVertical,
} from "react-icons/bs";

const SIDEBAR_ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const makeDashboardIcon = (children) => function DashboardSidebarStyleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...SIDEBAR_ICON_PROPS} {...props}>
      {children}
    </svg>
  );
};

export const DashboardAddIcon = makeDashboardIcon(<><path d="M12 5v14" /><path d="M5 12h14" /></>);
export const DashboardEditIcon = makeDashboardIcon(<><path d="M4 20h4.5L19 9.5a2.1 2.1 0 0 0 0-3L17.5 5a2.1 2.1 0 0 0-3 0L4 15.5V20Z" /><path d="M13.5 6 18 10.5" /></>);
export const DashboardDeleteIcon = makeDashboardIcon(<><path d="M4 6h16" /><path d="M9 6V4h6v2" /><path d="M18 6l-1 14H7L6 6" /><path d="M10 11v5" /><path d="M14 11v5" /></>);
export const DashboardCloseIcon = makeDashboardIcon(<><path d="M6 6l12 12" /><path d="M18 6 6 18" /></>);
export const DashboardSearchIcon = makeDashboardIcon(<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>);
export const DashboardCheckIcon = makeDashboardIcon(<path d="m5 12 4 4 10-10" />);
export const DashboardDownloadIcon = makeDashboardIcon(<><path d="M12 4v11" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></>);
export const DashboardOpenIcon = makeDashboardIcon(<><path d="M14 4h6v6" /><path d="M10 14 20 4" /><path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" /></>);
export const DashboardVisibleIcon = makeDashboardIcon(<><path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" /><circle cx="12" cy="12" r="2.5" /></>);
export const DashboardHiddenIcon = makeDashboardIcon(<><path d="M4 4l16 16" /><path d="M10.6 10.6A2.5 2.5 0 0 0 13.4 13.4" /><path d="M8.5 5.8A10.4 10.4 0 0 1 12 5c6 0 9 7 9 7a14.8 14.8 0 0 1-2.7 3.7" /><path d="M6.1 7.4A14.8 14.8 0 0 0 3 12s3 7 9 7a10.2 10.2 0 0 0 4.2-.9" /></>);
export const DashboardFileIcon = BsFileText;
export const DashboardImageIcon = BsImage;
export const DashboardHomeIcon = makeDashboardIcon(<><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></>);
export const DashboardUserIcon = makeDashboardIcon(<><path d="M19 21a7 7 0 0 0-14 0" /><circle cx="12" cy="8" r="4" /></>);
export const DashboardProjectIcon = makeDashboardIcon(<><path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1.5" /><path d="M3 9h18l-1.3 9.2A2 2 0 0 1 17.7 20H6.3a2 2 0 0 1-2-1.8L3 9Z" /><path d="m10 14-1.5 1.5L10 17" /><path d="m14 14 1.5 1.5L14 17" /></>);
export const DashboardSkillIcon = makeDashboardIcon(<><path d="M12 3v4" /><path d="M12 17v4" /><path d="M5 10v4" /><path d="M19 10v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M10 5h4" /><path d="M10 19h4" /><circle cx="12" cy="12" r="3" /></>);
export const DashboardWorkIcon = makeDashboardIcon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /><path d="M12 12v2" /></>);
export const DashboardLockIcon = makeDashboardIcon(<><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>);
export const DashboardShieldIcon = makeDashboardIcon(<><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>);
export const DashboardMegaphoneIcon = makeDashboardIcon(<><path d="M4 13h3l9 4V7l-9 4H4v2Z" /><path d="M7 13v5" /><path d="M19 9.5c.7.6 1 1.4 1 2.5s-.3 1.9-1 2.5" /></>);
export const DashboardPlayIcon = makeDashboardIcon(<path d="M8 5v14l11-7L8 5Z" />);
export const DashboardAcademicIcon = DashboardWorkIcon;
export const DashboardSoftSkillIcon = DashboardSkillIcon;
export const DashboardLinkIcon = makeDashboardIcon(<><path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-.9.9" /><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l.9-.9" /></>);
export const DashboardScreenIcon = makeDashboardIcon(<><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 18v3" /><path d="M8 11s1.4-3 4-3 4 3 4 3-1.4 3-4 3-4-3-4-3Z" /><circle cx="12" cy="11" r="1" /></>);
export const DashboardEventsIcon = makeDashboardIcon(<><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="m9 15 2 2 4-5" /></>);
export const DashboardCalendarIcon = DashboardEventsIcon;
export const DashboardSettingsIcon = makeDashboardIcon(<><path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 0 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1A1.7 1.7 0 0 0 21 10h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" /></>);
export const DashboardCollectionIcon = BsCollection;
export const DashboardChartIcon = BsBarChartLine;
export const DashboardMenuIcon = BsThreeDotsVertical;
export const DashboardStatusIcon = BsListCheck;
export const DashboardUnlinkIcon = BsPersonDash;
export const DashboardPowerIcon = BsPower;
export const DashboardSparkIcon = BsStars;
export const DashboardMailIcon = BsEnvelope;
export const DashboardGlobeIcon = BsGlobe2;
export const DashboardLocationIcon = BsGeoAlt;
export const DashboardPhoneIcon = BsTelephone;
export const DashboardCameraIcon = makeDashboardIcon(<><path d="M4 8h4l1.5-2h5L16 8h4v11H4V8Z" /><circle cx="12" cy="13.5" r="3" /></>);
export const DashboardUploadIcon = makeDashboardIcon(<><path d="M12 20V9" /><path d="m7 14 5-5 5 5" /><path d="M5 20h14" /></>);
export const DashboardWarningIcon = BsExclamationTriangle;
