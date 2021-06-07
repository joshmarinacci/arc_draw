import './App.css'
import {HBox} from './common.js'
import {BufferEditor} from './BufferEditor.js'

function App() {

  return <HBox>
    <BufferEditor width={1280} height={768} initialZoom={4}/>
  </HBox>
}

export default App;
