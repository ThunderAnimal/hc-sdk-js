export default `
.hidden {
    display: none;
}
#gesundheitslogin iframe,
#gesundheitsregister iframe,
#gesundheitslogin div,
#gesundheitsregister div,
#gesundheitslogin input,
#gesundheitsregister input,
#gesundheitslogin button,
#gesundheitsregister button {
    margin: 0;
    padding: 0;
    border: 0;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
}

#gesundheitslogin iframe,
#gesundheitsregister iframe {
  width: 100%;
}

#gesundheitslogin iframe {
  height: 4rem;
}

#gesundheitsregister iframe {
  width: 100%;
  height: 8rem;
}

#gesundheitslogin iframe input,
#gesundheitsregister iframe input,
#gesundheitslogin button,
#gesundheitsregister button,
#gesundheitslogin input,
#gesundheitsregister input {
  overflow: visible;
}

#gesundheitslogin label,
#gesundheitsregister label {
  color: #909499;
  line-height: 2rem;
}

#gesundheitslogin .row,
#gesundheitsregister .row {
  padding: 0.3rem 0;
}

#gesundheitslogin input:not([type]),
#gesundheitsregister input:not([type]),
#gesundheitslogin input:not(.browser-default),
#gesundheitsregister input:not(.browser-default) {
  color: #999999;
  border: none;
    background-color: transparent;
  border-bottom: 1px solid rgba(0,0,0,0.87);
  border-radius: 0;
  outline: none;
  height: 3rem;
  width: 100% !important;
  font-size: 1rem;
  margin: 0 5px 5px 0px !important;
  transition: all 0.3s;
}

#gesundheitslogin input:not([type]):focus:not([readonly]),
#gesundheitslogin input:not(.browser-default):focus:not([readonly]),
#gesundheitsregister input:not([type]):focus:not([readonly]),
#gesundheitsregister input:not(.browser-default):focus:not([readonly]) {
  border-bottom: 2px solid #ff7f00;
}

#gesundheitslogin input:not([type]):focus:not([readonly]) + label,
#gesundheitslogin input:not(.browser-default):focus:not([readonly]) + label,
#gesundheitsregister input:not([type]):focus:not([readonly]) + label,
#gesundheitsregister input:not(.browser-default):focus:not([readonly]) + label {
  color: #ff7f00;
}

#gesundheitslogin input:not(.browser-default) + label:after,
#gesundheitsregister input:not(.browser-default) + label:after {
  display: block;
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  opacity: 0;
  -webkit-transition: .2s opacity ease-out, .2s color ease-out;
  transition: .2s opacity ease-out, .2s color ease-out;
}

#gesundheitslogin button,
#gesundheitsregister button {
  width: 98%;
  height: 3rem;
  background: inherit;
  background-color: #ff7f00;
  color: #FFFFFF;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

#gesundheitslogin button:hover,
#gesundheitsregister button:hover {
  background-color: #2576DC;
}

#gesundheitslogin button:disabled,
#gesundheitsregister button:disabled {
  background-color: grey;
  -moz-box-shadow: none;
  -webkit-box-shadow: none;
  box-shadow: none;
}
`;
