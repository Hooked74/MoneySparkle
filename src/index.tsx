import React, { PureComponent, Fragment } from 'react';
import { render } from 'react-dom';
import MoneySparkle from './MoneySparkle';
import './style.css';

class App extends PureComponent {
  private moneySparkle: MoneySparkle;
  private size = { width: 400, height: 400 };

  render() {
    return (
      <Fragment>
        <div className="wrapper" onClick={e => this.moneySparkle.onClick(e)}>
          <span>Click me</span>
          <MoneySparkle size={this.size} ref={ref => (this.moneySparkle = ref)} />
        </div>
      </Fragment>
    );
  }
}

render(<App />, document.getElementById('root'));
