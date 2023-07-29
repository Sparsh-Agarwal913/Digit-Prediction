import React from 'react'

export default function ClearButton({ Clear }) {
    const handleClick = () => {
        Clear();
      };
  return (
    <div>
        <button onClick={handleClick}>Clear</button>
    </div>
  )
}
