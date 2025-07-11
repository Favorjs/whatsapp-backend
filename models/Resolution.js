module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Resolution', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'completed'),
        defaultValue: 'pending'
      },
      votingStart: {
        type: DataTypes.DATE,
        field: 'voting_start'
      },
      votingEnd: {
        type: DataTypes.DATE,
        field: 'voting_end'
      }
    }, {
      tableName: 'resolutions',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  };