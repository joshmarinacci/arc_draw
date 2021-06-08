import './App.css'
import {HBox} from './common.js'
import {BufferEditor} from './BufferEditor.js'

function App() {

  return <HBox>
    <BufferEditor width={1280} height={768} initialZoom={6}/>
  </HBox>
}

export default App;
