import './App.css';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import MonacoEditor from 'react-monaco-editor';
import { Flipped, Flipper } from "react-flip-toolkit";
import Grid from '@mui/material/Grid';
import { FaArrowRight, FaArrowLeft, FaPlay } from 'react-icons/fa';
import { VscDebugRestart } from 'react-icons/vsc';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  fontSize: '75%',
  textAlign: 'center',
  alignContent: 'center',
  color: theme.palette.text.primary,
  width: 35,
  height: 35,
}));


export default class App extends React.Component {
  constructor(props) {
    super(props)
    var inputArray = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100))
    this.state = {
      array: inputArray,
      originalArray: inputArray,
      logIndex: 0,
      logs: [],
      runtime: 0,
      highlighted: [],
      buttonLock: true,
      buttonDisabled: true,
      sortSpeed: 100,
      buttonSpeedLabel: "fastest",
      isPlaying: false,
    }

    this.onLogsReturned = this.onLogsReturned.bind(this)
    this.onRandomizeInput = this.onRandomizeInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  onLogsReturned(logs) {
    this.setState({ logs: logs, logIndex: 0, buttonLock: false, buttonDisabled: false })
  }

  onRandomizeInput() {
    this.setState({ logs: [], logIndex: 0, highlighted: [], buttonDisabled: true, array: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)) })
  }

  stepForward() {
    if (this.state.buttonLock) return
    const logIndexNext = this.state.logIndex + 1
    const logs = this.state.logs
    if (logIndexNext >= logs.length) {
      return
    }
    const currentLog = logs[logIndexNext]
    this.setState({ logIndex: logIndexNext, array: currentLog["array"], highlighted: currentLog["indices"] })
  }

  stepBack() {
    if (this.state.buttonLock) return
    const logIndex = this.state.logIndex
    const logs = this.state.logs
    if (logIndex <= 0) {
      return
    }
    const prevLog = logs[logIndex - 1]
    const currentLog = logs[logIndex]
    this.setState({ logIndex: logIndex - 1, array: prevLog["array"], highlighted: currentLog["indices"] })
  }

  async play() {
    const timer = ms => new Promise(res => setTimeout(res, ms))
    this.setState({ isPlaying: true }, async () => {
      while (this.state.isPlaying && (this.state.logIndex + 1 < this.state.logs.length)) {
        this.stepForward();
        await timer(this.state.sortSpeed);
      }
      this.setState({ isPlaying: false })
    })
  }

  handleChange(event) {
    var speedLabel = event.target.value
    var sortingSpeed

    if (speedLabel === "fastest") {
      sortingSpeed = 187.5
    } else if (speedLabel === "fast") {
      sortingSpeed = 375
    } else if (speedLabel === "medium") {
      sortingSpeed = 750
    } else {
      sortingSpeed = 1500
    }

    this.setState({ 
      buttonSpeedLabel: speedLabel,
      sortSpeed: sortingSpeed
    })
  }

  reset() {
    this.setState({ logIndex: 0, highlighted: [], array: this.state.originalArray, isPlaying: false })
  }

  async onAnimationComplete() {
    // Lock buttons and sleep
    this.setState({ buttonLock: true })
    await new Promise(r => setTimeout(r, 200));
    this.setState({ highlighted: [], buttonLock: false })
  }

  render() {
    return (
      <div className="App">
        <Grid container>
          <Grid item xs={8}>
            <header className="App-header">
              <h1 className="HeaderTitle">Sorting Visualizer</h1>

              <h4 className="StepCounterTitle">{"Step " + this.state.logIndex}</h4>

              <Stack className="Stack" direction="row" spacing={2}>
                <Flipper flipKey={this.state.array.join('')} onComplete={() => this.onAnimationComplete()}>
                  <ul className="list">
                    {this.state.array.map((num, index) => (
                      <Flipped key={index} flipId={num}>
                        <Item style={this.state.highlighted.includes(index) ? { backgroundColor: '#BBB15AFF' } : {}}>{num}</Item>
                      </Flipped>
                    ))}
                  </ul>
                </Flipper>
              </Stack>

              <Stack className="Stack" direction="row" spacing={2}>
                <Button variant="contained" color="primary" disabled={this.state.buttonDisabled} onClick={() => this.stepBack()}>
                  <FaArrowLeft />
                </Button>
                <Button variant="contained" color="primary" disabled={this.state.buttonDisabled} onClick={() => this.stepForward()}>
                  <FaArrowRight />
                </Button>
              </Stack>
              <Stack className="Stack" direction="row" spacing={2}>
                <Button variant="contained" color="primary" disabled={this.state.buttonDisabled || this.state.isPlaying} onClick={() => this.play() }>
                  <FaPlay />
                </Button>
                <Button variant="contained" color="primary" disabled={this.state.buttonDisabled} onClick={() => this.reset()}>
                  <VscDebugRestart />
                </Button>
              </Stack>

              <ToggleButtonGroup
                color="primary"
                value={this.state.buttonSpeedLabel}
                exclusive
                onChange={this.handleChange}
              >
                <ToggleButton value="slow">1x</ToggleButton>
                <ToggleButton value="medium">2x</ToggleButton>
                <ToggleButton value="fast">3x</ToggleButton>
                <ToggleButton value="fastest">4x</ToggleButton>
              </ToggleButtonGroup>

            </header>
          </Grid>
          <CodeEditor onLogsReturned={this.onLogsReturned} onRandomizeInput={this.onRandomizeInput} array={this.state.array} />
        </Grid>
      </div>
    );
  }
}

class CodeEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      code: "def sorting_algorithm(arr):\n\tprint('Hello world')\n",
      output: [this.createOutputTextComponent("Please enter your code and press submit...")]
    }
  }

  submitCode() {
    this.setState({ output: [] })
    fetch('/user-code', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: window.btoa(this.state.code),
        array: this.props.array
      })
    }).then(res => res.json()).then(data => {
      if (data.message) {
        this.constructError(data.message)
      } else {
        this.constructOutput(data)
      }
      this.props.onLogsReturned(data.arrayLog)
    });
  }

  async constructOutput(data) {
    this.setState({ output: [...this.state.output, this.createOutputTextComponent("Code run successfully!")] })
    await new Promise(r => setTimeout(r, 1000));
    this.setState({ output: [...this.state.output, this.createOutputTextComponent("Runtime: " + data.runtime.toFixed(3) + "ms")] })
  }

  async constructError(text) {
    this.setState({ output: [...this.state.output, this.createOutputTextComponent("Error: " + text)] })
  }

  createOutputTextComponent(text) {
    return <p className="OutputText"><i>{text}</i></p>
  }

  render() {
    return (
      <Grid item xs={4}>
        <MonacoEditor
          height="70%"
          language="python"
          theme="vs-light"
          value={this.state.code}
          options={{
            selectOnLineNumbers: false,
            automaticLayout: true,
            fontSize: 15,
            minimap: {
              enabled: false
            },
          }}
          onChange={(newValue, e) => this.setState({ code: newValue })}
          editorDidMount={(editor, monaco) => editor.focus()}
        />
        <Stack className="Stack" direction="column" spacing={2}>
          <Stack direction="row" spacing={3}>
            <Button style={{ maxWidth: '60px', paddingLeft: 40, paddingRight: 40 }} variant="contained" color="primary" onClick={() => this.submitCode()}>
              Submit
            </Button>
            <Button style={{ maxWidth: '400px', paddingLeft: 20, paddingRight: 20 }} variant="contained" color="primary" onClick={() => {
              this.setState({ output: [this.createOutputTextComponent("Please enter your code and press submit...")] });
              this.props.onRandomizeInput();
            }}>
              Randomize Input
            </Button>
          </Stack>
          {this.state.output}
        </Stack>
      </Grid>
    );
  }
}