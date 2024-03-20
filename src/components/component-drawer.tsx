// import React, { useState } from 'react';
import { Drawer } from 'antd';

/*
TODO:
[ ] form layout and data bindings
[ ] update data to parent component
*/

export default function ComponentDrawer({closeDrawer , drawerOpen, data}) {

  return (
    <>
      <Drawer title="Basic Drawer" onClose={closeDrawer} open={drawerOpen}>
        <p>{data?.name}</p>
        <p>{data?.title}</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

// export default ComponentDrawer