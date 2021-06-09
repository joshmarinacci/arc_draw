import './App.css'
import {BufferEditor} from './BufferEditor.js'
import {HBox} from "appy-comps"

function App() {

  return <HBox>
    <BufferEditor width={1280} height={768} initialZoom={6}/>
  </HBox>
}

export default App;
