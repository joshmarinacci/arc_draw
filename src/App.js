import './App.css'
import {BufferEditor} from './BufferEditor.js'
import {
    DialogContainer,
    DialogContext,
    DialogContextImpl,
    HBox, PopupContainer,
    PopupContext,
    PopupContextImpl
} from "josh_react_util"

function App() {
    return <PopupContext.Provider value={new PopupContextImpl()}>
        <DialogContext.Provider value={new DialogContextImpl()}>
            <HBox>
                <BufferEditor initialZoom={6}/>
                <DialogContainer/>
                <PopupContainer/>
            </HBox>
        </DialogContext.Provider>
    </PopupContext.Provider>
}

export default App;
