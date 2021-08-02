import React, { Component, useEffect, useState } from 'react'
import { JArrayObject, JContent, JFile, JHttp, JObject } from './Jpc';
// import LabelFieldFormat from './dependencies/views/LabelFieldFormat';
import './Guessing.css';
import { dollarSign, questionMark } from './Images';

export class GuessItRight extends Component {
    constructor(props) {
        super(props);
        this.images = [];
    }
    
    forwardImages = () => {
        return this.images;
    }

    render() {
        return (
            <div>
                <Admin getImages={(images) => {this.images = images}} />
                <PlayGame loadImages={this.forwardImages} />
            </div>
        )
    }
}

export default GuessItRight

export const ExportType = {
    Direct: "direct",
    Indirect: "indirect"
}

export function Admin({getImages, exportType=ExportType.Direct}) {

    const [state, setState] = useState({
        slot: 2, images: [], loaded: false
    });

    useEffect(() => {
        if(!state.loaded) {
            JHttp.get(`http://localhost:909/gir/get`, (data) => {
                let stateSpace = {}, images = [], watcher = [];
                data.forEach(element => {
                    const name = "image"+element.id, data = element.data;
                    if(!watcher.includes(data)) {
                        stateSpace[name] = element.data;
                        images.push(name);
                        watcher.push(data);
                    }
                });
                setState(prev => ({...prev, images: images, ...stateSpace, loaded: true, slot: images.length}));
            });
        }
    }, [state.loaded]);

    const allocateImageSpace = (num) => {
        let res = [], stateSpace = {}, bin = [];
        for (let i = 1; i <= num; i++) {
            const name = "image"+(i+1);
            res.push(name);
            stateSpace[name] = state[name] || "";
            if(i > num) {
                bin.push(state[name]);
            }
        }
        setState(prev => ({...JObject.removeKey(prev, bin), images: res, ...stateSpace}));
    }

    const handleChange = (e) => {
        const {name, value} = e.target;
        if(name === "slot") {
            const rounded = value;
            setState({...state, [name]: rounded});
        }
    }

    const checkDoubleOccurrence = (value) => {
        let res = false, checkList = [];
        for (const key in state) {
            if (state[key] === value) {
                checkList.push(key);
            }
        }
        if(checkList.length > 1) {
            res = true;
        }
        return res;
    }

    const handleImageChange = (e) => {
        const [file] = e.target.files;
        // const element = document.getElementById(e.target.name);
        if(file) {
            JFile.convert.toBase64(file).then(
                (data) => {
                    // if(!checkDoubleOccurrence(data)) {
                    //     element.src = data;
                    //     element.alt = "";
                    // }
                    // else {
                    //     alert("Same image cannot be used than once ");
                    // }
                    setState({...state, [e.target.name]: data});
                }
            );
            
        }
    }

    const handleSave = () => {
        let images = [];
        for (const key in state) {
            if (key.includes("image") && key !== "images" && state[key] !== "") {
                if(exportType === ExportType.Direct) {
                    images.push({pos: images.length+1, data: state[key]}, {pos: images.length+2, data: state[key]});
                }
                else {
                    images.push({pos: images.length+1, data: state[key]});
                }
            }
        }
        if(exportType === ExportType.Direct) {
            if (images.length < (state.slot * 2)) {
                alert("All slot must be fixed");
                return;
            }
        }
        else {
            if (images.length < state.slot) {
                alert("All slot must be fixed");
                return;
            }
        }
        //store images
        if(getImages) {
            getImages(images);
        }
        else {
            if(window.confirm("Are you sure you want to save?")){
                JHttp.post(`http://localhost:909/gir/save`, images, (res) => {
                    alert(res.description);
                }, () => alert("Network Error"));
            }
        }
        
    }

    const imageSlot = (name) => {
        return (
            <div key={name} className="image-slot">
                <img id={name} src={state[name]? state[name] : "data:image/png;base64,"+questionMark} alt="Choose" />
                <input type="file" name={name} onChange={handleImageChange} />
            </div>
        )
    }

    return (
        <div className="form-block jpc" style={{marginBottom: '50px', height: '100%', width: '100%'}}>
            <LabelFieldFormat label="Total Number of Image Slot:" style={{width: '100%'}}>
                <input style={{width: '100%'}} name="slot" value={state.slot} onChange={handleChange} />
                <button onClick={() => allocateImageSpace(state.slot)}>Initialize</button>
            </LabelFieldFormat>
            <div className="image-container">
                {
                    state.images.map(name => (imageSlot(name)))
                }
            </div>
            <button onClick={handleSave}>Save</button>
        </div>
    )
}

export function LabelFieldFormat({label, children, className = "", style}) {
    return(
        <div className={className} style={{...{display: 'flex', justifyContent: 'space-around', height: '40px'}, ...style}}>
            <label style={{minWidth: '500px'}}>{label}</label>
            {children}
        </div>
    )
}

export function PlayGame({counter = 30}) {

    const [state, setState] = useState({
        counter: counter, running: false, selections: [], temp: "", score: 0, correct: [], images: [], loaded: false
    });

    useEffect(() => {
        if(!state.loaded) {
            JHttp.get(`http://localhost:909/gir/get`, (data) => {
                setState(prev => ({...prev, images: data, loaded: true}));
            });
        }
    }, [state.loaded]);

    const imageSlot = (obj) => {
        return (
            <div key={obj.pos} className="image-slot">
                {
                    JArrayObject.find.getBoolean(state.correct, obj.pos, "pos")?
                        <img src={obj.svg? `data:image/png;base64,${obj.svg}` : obj.data} alt="Choose" />
                    : <div className="number-card">
                        {obj.pos}
                    </div>
                }
            </div>
        )
    }

    const handleStart = () => {
        setState(prev => ({...prev, correct: [], images: JArrayObject.randomize.byKey(prev.images, "pos"), running: true, score: 0}));
    }

    const handleStop = () => {
        setState(prev => ({...prev, running: false, counter: 30, score: 0}));
    }

    useEffect(() => {
        if(state.running) {
            setTimeout(() => {
                if (state.counter === 0) {
                    //Time up
                    handleStop();
                }
                else {
                    setState(prev => ({...prev, counter: prev.counter - 1}));
                }
            },  1000);
        }
    }, [state.counter, state.running]);

    const checkSelection = (selections) => {
        const a = selections[0], b = selections[1];
        if(a !== b) {
            const valueA = JArrayObject.find.getValue(state.images, a, "pos", "data");
            const valueB = JArrayObject.find.getValue(state.images, b, "pos", "data");
            
            const data = [
                {pos: a, data: valueA},
                {pos: b, data: valueB},
            ]
            setState(prev => ({...prev, correct: prev.correct.concat(data)}));
    
            setTimeout(() => {
                setState(prev => {
                    let newData;
                    if(valueA === valueB) {
                        newData = JArrayObject.replaceObject(prev.images, "pos", a, {...data[0], svg: dollarSign});
                        newData = JArrayObject.replaceObject(newData, "pos", b, {...data[1], svg: dollarSign});
                        return {...prev, images: newData, score: prev.score + 100};
                    }
                    else {
                        let newData2;
                        newData2 = JArrayObject.replaceObject(prev.images, "pos", a, {...data[0]});
                        newData2 = JArrayObject.replaceObject(newData2, "pos", b, {...data[1]});
                        newData = JArrayObject.deleteObject(prev.correct, "pos", a);
                        newData = JArrayObject.deleteObject(newData, "pos", b);
                        return {...prev, correct: newData, images: newData2};
                    }
                });
            }, 300);
        }
        
    }

    useEffect(() => {
        document.onkeydown = (e) => {
            if (state.running) {
                if(e.code === "Space") {
                    handleStop();
                    return;
                }
                if(!isNaN(e.key)) {
                    //It's number
                    setState(prev => ({...prev, temp: prev.temp.concat(e.key)}));
                }
                else {
                    if(e.code === "Backspace") {
                        setState(prev => ({...prev, selections: prev.selections.concat(parseInt(prev.temp)), temp: JContent.backspace(prev.temp)}));
                    }
                    if(e.code === "Enter") {
                        if (state.selections.length === 1 && state.temp !== "") {
                            //Check answer
                            setState(prev => ({...prev, temp: "", selections: []}));
                            checkSelection([state.selections[0], parseInt(state.temp)]);
                        }
                        else {
                            setState(prev => ({...prev, selections: prev.selections.concat(parseInt(prev.temp)), temp: ""}));
                        }
                    }
                }
            }
            else {
                if(e.code === "Space") {
                    handleStart();
                }
            }
        }
    })

    return(
        <div className="form-block jpc">
            <fieldset>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    {/* <div>
                        <label>Player: <span >{player.toUpperCase()}</span></label>
                    </div> */}
                    <div>
                        <label>Time Left: <span style={{color: state.counter <= 10? 'red' : 'green'}}>{state.counter}s</span></label>
                    </div>
                    <div>
                        <label>Score: <span>{state.score}</span></label>
                    </div>
                    <span className={state.running? "jpc-disabled" : ""} style={{padding: "5px 10px", color: '#57e057', boxShadow: "0px 5px 10px 2px gray", cursor: "pointer", fontWeight: "bold"}} onClick={handleStart}>START</span>
                </div>
            </fieldset>
            <div>
                <div className="image-container">
                    {
                        state.images.map(obj => (imageSlot(obj)))
                    }
                </div>
            </div>
            <div className="show-temp">{state.temp}</div>
        </div>
    )
}
