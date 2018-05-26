/**
 * API to delete a project template
 */
import validate from 'express-validation';
import Joi from 'joi';
import { middleware as tcMiddleware } from 'tc-core-library-js';
import models from '../../models';

const permissions = tcMiddleware.permissions;

const schema = {
  params: {
    templateId: Joi.number().integer().positive().required(),
  },
};

module.exports = [
  validate(schema),
  permissions('projectTemplate.delete'),
  (req, res, next) => {
    const where = {
      deletedAt: { $eq: null },
      id: req.params.templateId,
    };

    return models.sequelize.transaction(tx =>
      // Update the deletedBy
      models.ProjectTemplate.update({ deletedBy: req.authUser.userId }, {
        where,
        returning: true,
        raw: true,
        transaction: tx,
      })
        .then((updatedResults) => {
          // Not found
          if (updatedResults[0] === 0) {
            const apiErr = new Error(`Project template not found for template id ${req.params.templateId}`);
            apiErr.status = 404;
            return Promise.reject(apiErr);
          }

          // Soft delete
          return models.ProjectTemplate.destroy({
            where,
            transaction: tx,
            raw: true,
          });
        })
        .then(() => {
          res.status(204).end();
        })
        .catch(next),
    );
  },
];
