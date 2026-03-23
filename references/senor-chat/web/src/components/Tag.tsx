import React from "react"
import { Tag as TagType} from "../store/messageStore";


const Tag = (props: TagType) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: props.bgColor,
      color: props.color,
      padding: '4px 5px',
      gap: '10px',
      borderRadius: '4px',
      textAlign: 'center',
      fontSize: '10px',
      lineHeight: '12px',
      fontWeight: props.fontWeight || 500,
      height: '20px',
      minWidth: 'auto',
      flex: 'none',
      flexGrow: 0,
      whiteSpace: 'nowrap'
    }}>
      {props.text}
    </div>
  )
};

// /* ID */

// /* Auto layout */
// display: flex;
// flex-direction: row;
// justify-content: center;
// align-items: center;
// padding: 4px 5px;
// gap: 10px;

// width: 33px;
// height: 20px;

// background: rgba(255, 255, 255, 0.1);
// border-radius: 2px;

// /* Inside auto layout */
// flex: none;
// order: 0;
// flex-grow: 0;


export default Tag;
