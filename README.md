# Microkit Configuration Tool

## Features

- [x] System canvas
  - [x] List available components (i.e. PDs/VMs/Subsystems) on the sidebar
  - [x] Drag and drop to add components 
  - [x] Edit and delete components
  - [x] Connect components with channels
  - [x] Edit and delete channels
  - [x] Memory bar showing memory regions with specified physical address
  - [x] Editable table for editing memory regions
  - [x] Edit mappings with drop-down menu listing available memory regions
  - [x] Edit IRQs with drop-down menu listing available devices
  - [x] Zoom in/out
- [x] Save and load diagram files
  - [x] File picker for downloading and uploading
  - [x] Filename editing
  - [x] Save diagram as a json string
  - [x] Read content of diagram
  - [x] Load diagram on the canvas
  - [x] Load memry regions
- [x] Integration with SDF generator
  - [x] Convert configurations to a JSON string
  - [x] Build a WASM receiving a JSON string and return XML
  - [x] Exported function in SDF generator to receive a JSON string from the GUI
  - [x] Build system description regarding to the configuration JSON
  - [x] Copy XML to the result memory
- [x] Device tree viewer
  - [x] Drop-down menu for board configuration
  - [x] Read DTB files
  - [x] Parse device tree json string
  - [x] Render device tree in the viewer
- [x] Integration with SDF verifier
- [x] Header file template generation
- [ ] Interface for importing subsystems
  - [x] Interface that defines variables and operations of a component
  - [x] Example of serial system that creates necessary MRs/Channels/PDs/IRQs if two clients are connected
  - [ ] Simpler configuration for importing subsystems without implementation in SDF generator
- [ ] Clean-up

## Installation

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

