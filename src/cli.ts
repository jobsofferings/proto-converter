import inquirer from 'inquirer'
import { converter } from './index'
import { getBasicProtoConfig } from './utils'
import { customInspect } from './utils/log'

async function main() {
  const config = getBasicProtoConfig()
  if (config?.protoPath && config?.serviceName) {
    await converter(config.protoPath, config.serviceName)
  } else {
    inquirer
      .prompt([
        {
          name: 'protoPath',
          type: 'input',
        },
        {
          name: 'serviceName',
          type: 'input',
        },
      ])
      .then(async ({ protoPath, serviceName }) => {
        await converter(protoPath, serviceName)
      })
      .catch((error) => {
        if (error.isTtyError) {
          customInspect(
            "Prompt couldn't be rendered in the current environment",
          )
        } else {
          customInspect(error)
        }
      })
  }
}

main()
