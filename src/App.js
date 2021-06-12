import './App.css'
import {BufferEditor} from './BufferEditor.js'
import {HBox, PopupManager, PopupManagerContext} from "appy-comps"

function App() {
  return <PopupManagerContext.Provider value={new PopupManager()}>
   <HBox>
    <BufferEditor initialZoom={6}/>
  </HBox>
  </PopupManagerContext.Provider>
}

export default App;
