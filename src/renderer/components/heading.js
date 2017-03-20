const React = require('react')

const colors = require('material-ui/styles/colors')

class Heading extends React.Component {
  static get propTypes () {
    return {
      level: React.PropTypes.number
    }
  }

  static get defaultProps () {
    return {
      level: 1
    }
  }

  render () {
    const HeadingTag = 'h' + this.props.level
    const style = {
      color: colors.grey100,
      fontSize: 20,
      marginBottom: 15,
      marginTop: 30
    }
    return (
      <HeadingTag style={style}>
        {this.props.children}
      </HeadingTag>
    )
  }
}

module.exports = Heading
