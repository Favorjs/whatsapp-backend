module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Shareholder', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'phone_number'
      },
      shareholding: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'suspended'),
        defaultValue: 'active'
      }
    }, {
      tableName: 'shareholders',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  };