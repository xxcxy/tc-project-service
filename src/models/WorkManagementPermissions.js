/* eslint-disable valid-jsdoc */

/**
 * The WorkManagementPermissions model
 */
module.exports = (sequelize, DataTypes) => {
  const WorkManagementPermissions = sequelize.define('WorkManagementPermissions', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    policy: { type: DataTypes.STRING(255), allowNull: false },
    allowRule: { type: DataTypes.JSON, allowNull: false },
    denyRule: DataTypes.JSON,
    projectTemplateId: { type: DataTypes.BIGINT, allowNull: false },

    deletedAt: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    deletedBy: { type: DataTypes.INTEGER, allowNull: true },
    createdBy: { type: DataTypes.INTEGER, allowNull: false },
    updatedBy: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'work_management_permissions',
    paranoid: true,
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt',
    deletedAt: 'deletedAt',
    indexes: [
      {
        unique: true,
        fields: ['policy', 'projectTemplateId'],
      },
    ],
  });

  return WorkManagementPermissions;
};
