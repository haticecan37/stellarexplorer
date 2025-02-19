import React from 'react'
import {FormattedMessage} from 'react-intl'
import truncate from 'lodash/truncate'

import {xdr} from '../../lib/stellar'
import {
  scValToAddress,
  scvalToBigNumber,
} from '../../lib/stellar/xdr_scval_utils'

const scValToString = (type, scVal) => {
  let str
  switch (type) {
    case 'Bytes':
      str = scVal.bytes().toString('hex')
      break
    case 'Str':
      str = scVal.str().toString()
      break
    case 'Address':
      str = scValToAddress(scVal)
      break
    case 'Sym':
      str = scVal.sym().toString()
      break
    case 'U32':
    case 'I32':
    case 'U64':
    case 'I64':
    case 'U128':
    case 'I128':
    case 'I256':
      str = scvalToBigNumber(scVal).toNumber()
      break
    case '':
    case 'Void': // not seeing this yet but assuming it will be changed from '' to 'Void' at some point
      str = ''
      break
    // TODO: #513
    // case 'Map':
    //   const map = scVal.map()
    //   str = JSON.stringify(map)
    //   break
    default:
      str = undefined
  }
  return str
}
const invokeFunctionParamsRawtoRendered = (params) =>
  params.map((p) => {
    let scVal = xdr.ScVal.fromXDR(p.value, 'base64')
    let renderStr = scValToString(p.type, scVal) || p.value
    return {key: p.type || 'Void', value: renderStr}
  })

const renderContractParams = (
  params // : ReadonlyArray<Record<'key'|'value', string>>
) =>
  params.map(({key, value}, idx) => (
    <span key={idx}>
      &nbsp;&nbsp;&nbsp;&nbsp;{`  (${key}) `}
      <span title={value}>{truncate(value, {length: 40})}</span>
      <br />
    </span>
  ))

const InvokeHostFunction = (props) => {
  const hostFn = props['hostFunctions'][0]
  if ('upload_wasm' === hostFn.type) {
    // TODO: render parameters [hostFn.parameters] but havn't yet seen an op that has any ...
    return (
      <FormattedMessage
        id="operation.invoke.host.function.upload-wasm"
        values={{
          type: hostFn.type,
        }}
      />
    )
  } else if ('create_contract' === hostFn.type) {
    return (
      <span>
        <FormattedMessage
          id="operation.invoke.host.function.create-contract"
          values={{
            type: hostFn.type,
          }}
        />
        :<br />
        {renderContractParams(
          hostFn.parameters.map((p) => {
            const singleKey = Object.keys(p).filter((p) => p !== 'type')[0]
            return {key: singleKey, value: p[singleKey]}
          })
        )}
      </span>
    )
  } else if ('invoke_contract' === hostFn.type) {
    return (
      <span>
        <FormattedMessage
          id="operation.invoke.host.function.invoke-contract"
          values={{
            type: hostFn.type,
          }}
        />
        :<br />
        {renderContractParams(
          invokeFunctionParamsRawtoRendered(hostFn.parameters)
        )}
      </span>
    )
  }
  return <span>{hostFn.type}</span>
}

export default InvokeHostFunction
