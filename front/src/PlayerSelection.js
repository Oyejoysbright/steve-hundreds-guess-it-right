import React, { useEffect, useState } from 'react'
import { JArrayObject } from './Jpc';
import { questionMark } from './Images';
import { JHttp } from './Jpc';

const cc = 5000;

function PlayerSelection() {
    const [state, setState] = useState({
        randomizing: false, images: [], image: "data:image/png;base64,"+questionMark, counter: cc, loaded: false
    });

    useEffect(() => {
        if(!state.loaded) {
            JHttp.get(`http://localhost:909/gir/get`, (data) => {
                setState(prev => ({...prev, images: data, loaded: true}));
            });
        }
    }, [state.loaded]);
    
    useEffect(() => {
        document.onkeydown = (e) => {
            if(e.code === "Space"){
                if(state.randomizing) {
                    console.log("Stopped")
                    setState(prev => ({...prev, randomizing: false, counter: cc}));
                }
                else {
                    console.log("Started")
                    setState(prev => ({...prev, randomizing: true}));
                }
            }
        }
    });

    useEffect(() => {
        if(state.randomizing) {
            setTimeout(() => {
                if(state.counter !== 0) {
                    if(state.images.length > 1) {
                        setState(prev => {
                            const images = JArrayObject.randomize.byIndex(prev.images);
                            return {...prev, counter: prev.counter-1, image: images[0].data};
                        });
                    }
                }
                else {
                    setState(prev => ({...prev, randomizing: false, counter: cc}));
                }
            }, 20);
        }
    }, [state.counter, state.randomizing, state.images]);

    return (
        <div>
            <p style={{marginBottom: '10px'}}><em>Tap space bar to start and stop</em></p>
            <div className="player">
                <img style={{width: '350px', height: '400px'}} src={state.image} alt="Person" />
            </div>
        </div>
    )
}

export default PlayerSelection
