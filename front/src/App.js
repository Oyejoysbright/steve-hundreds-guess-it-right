import React, { useState } from 'react';
import './App.css';
import {FaUserTie} from 'react-icons/fa'
import {RiLockPasswordFill} from 'react-icons/ri'
import {BiLogOutCircle} from 'react-icons/bi'
import { Admin, ExportType, PlayGame } from './GuessItRight';
import PlayerSelection from './PlayerSelection';

const menu = {
  admin: "Administrator Interface",
  player: "Player Selection",
  gameZone: "Playing Ground"
}

function App() {
  const [state, setState] = useState({
    active: "Administrator Interface", loggedIn: false
  });

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      setState({...state, loggedIn: false});
    }
  }


  return (
    <div className="App-main">
      <header className="header">
        <div style={{textAlign: 'center', display: 'inline-block', maxWidth: '200px', color: 'var(--offWite'}}>
          <div className="first-child">GUESS IT</div>
          <div className="last-child">RIGHT</div>
        </div>
        <div style={{width: '100%', textAlign: 'right'}}>
          <Selector values={Object.values(menu)} value={state.active} onChange={(e) => {setState({...state, active: e.target.value})}} />
        </div>
        {
          state.loggedIn?
          <BiLogOutCircle size="30px" color="red" style={{marginLeft: '20px', cursor: 'pointer'}} onClick={handleLogout} />
          : null
        }
      </header>
      <section className="App-section">
        {
          !state.loggedIn?
          <Login onLogin={(status) => {setState({...state, loggedIn: status})}} />
          :
          <>
          {
            (state.active === menu.admin)?
              <Admin />
            : (state.active === menu.player)?
              <PlayerSelection />
            : (state.active === menu.gameZone)?
              <PlayGame />
            : null
          }
          </>
        }
      </section>
    </div>
  );
}

export default App;

function Login({onLogin}) {

  const handleLogin = (e) => {
    e.preventDefault();
    if(document.getElementById("username").value === "Admin" && document.getElementById("password").value === "123") {
      onLogin(true);
    }
    else {
      onLogin(false);
      alert("Username or password is incorrect");
    }
  }
  return (
    <div className="login">
      <div className="header">
        {/* <div className="first-child">GUESS IT</div>
        <div className="last-child">RIGHT</div> */}
        <img src="/padlock.png" alt="" />
      </div>
      <form className="form-block" onSubmit={handleLogin}>
        <ImageField src={<FaUserTie />} placeholder="Username" id="username" />
        <ImageField src={<RiLockPasswordFill />} placeholder="Password" id="password" type="password" autoComplete={false} />
        <button>LOGIN</button>
      </form>
    </div>
  )
}

function ImageField({id, name, value, onChange, type, src, autoComplete = false, placeholder}) {
  return(
    <div className="image-field">
      {src}
      <input id={id} autoComplete={autoComplete} placeholder={placeholder} type={type} name={name} value={value} onChange={onChange} />
    </div>
  )
}

function Selector({values = [], value = values[0], name, onChange, className}) {
  return (
    <div className={"selector-container " + className}>
      {
        values.map((val, index) => (
          <span onClick={() => {onChange({target: {name: name, value: val}})}} key={index} className={(val === value)? "active" : ""}>{val}</span>
        ))
      }
    </div>
  )
}