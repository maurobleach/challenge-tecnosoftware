import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity('inventory')
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "productid", unique: true })
  productId: number;

  @Column({ name: "availablestock", type: 'int', default: 0 })
  availableStock: number;

  @Column({ name: "reservedstock", type: 'int', default: 0 })
  reservedStock: number;
}
