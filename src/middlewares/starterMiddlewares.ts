
const cors = require('cors')
const helmet = require('helmet')
import  express from  'express'
import { RedisInitializer } from '../../lib/redis'
import allCronJobs from '../utility/cronJobs'


export default  function(app:  express.Application){
    app.use(cors())
    app.use(helmet())
    app.use(express.json())
    app.use(express.urlencoded({extended:false}))
    RedisInitializer() // Starting up redis
    allCronJobs()
}