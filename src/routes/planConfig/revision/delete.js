/**
 * API to delete a revsion
 */
import validate from 'express-validation';
import _ from 'lodash';
import Joi from 'joi';
import { middleware as tcMiddleware } from 'tc-core-library-js';
import { EVENT, RESOURCES } from '../../../constants';
import util from '../../../util';
import models from '../../../models';

const permissions = tcMiddleware.permissions;

const schema = {
  params: {
    key: Joi.string().max(45).required(),
    version: Joi.number().integer().positive().required(),
    revision: Joi.number().integer().positive().required(),
  },
};


module.exports = [
  validate(schema),
  permissions('planConfig.delete'),
  (req, res, next) => {
    models.sequelize.transaction(() => models.PlanConfig.findOne(
      {
        where: {
          key: req.params.key,
          version: req.params.version,
          revision: req.params.revision,
        },
      }).then((planConfig) => {
      if (!planConfig) {
        const apiErr = new Error('PlanConfig not found for key' +
            ` ${req.params.key} version ${req.params.version} revision ${req.params.revision}`);
        apiErr.status = 404;
        return Promise.reject(apiErr);
      }
      return planConfig.update({
        deletedBy: req.authUser.userId,
      });
    }).then(planConfig =>
      planConfig.destroy(),
    ).then((planConfig) => {
      util.sendResourceToKafkaBus(req,
        EVENT.ROUTING_KEY.PROJECT_METADATA_DELETE,
        RESOURCES.PLAN_CONFIG_REVISION,
        _.pick(planConfig.toJSON(), 'id'));
      res.status(204).end();
    })
      .catch(next));
  },
];
