module.exports = (sequelize, DataTypes) => {
    const Vote = sequelize.define('Vote', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vote: {
        type: DataTypes.ENUM('YES', 'NO'),
        allowNull: false
      },
      votingPower: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'voting_power'
      },
      voteType: {
        type: DataTypes.ENUM('WHATSAPP', 'USSD', 'IN_PERSON'),
        defaultValue: 'WHATSAPP',
        field: 'vote_type'
      },
      shareholderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'shareholder_id',
        references: {
          model: 'shareholders',
          key: 'id'
        }
      },
      resolutionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'resolution_id',
        references: {
          model: 'resolutions',
          key: 'id'
        }
      }
    }, {
      tableName: 'votes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });

    return Vote;
  };