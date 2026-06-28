"""Initial database migration

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    user_role = postgresql.ENUM('citizen', 'researcher', 'government', 'ngo', name='user_role', create_type=False)
    simulation_status = postgresql.ENUM('pending', 'running', 'completed', 'failed', name='simulation_status', create_type=False)
    
    user_role.create(op.get_bind(), checkfirst=True)
    simulation_status.create(op.get_bind(), checkfirst=True)

    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', user_role, default='citizen'),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now()),
    )

    # Scenarios table
    op.create_table(
        'scenarios',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('region', sa.String(100), nullable=False, default='Global'),
        sa.Column('actions', postgresql.JSON, nullable=False, default=list),
        sa.Column('start_year', sa.Integer, nullable=False, default=2024),
        sa.Column('end_year', sa.Integer, nullable=False, default=2034),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now()),
    )

    # Simulation runs table
    op.create_table(
        'simulation_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('scenario_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('scenarios.id'), nullable=False),
        sa.Column('status', simulation_status, default='pending'),
        sa.Column('error_message', sa.String(1000), nullable=True),
        sa.Column('started_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
    )

    # Projection results table
    op.create_table(
        'projection_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('simulation_run_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('simulation_runs.id'), nullable=False),
        sa.Column('year', sa.Integer, nullable=False),
        sa.Column('indicator', sa.String(100), nullable=False),
        sa.Column('value', sa.Float, nullable=False),
        sa.Column('confidence_low', sa.Float, nullable=True),
        sa.Column('confidence_high', sa.Float, nullable=True),
        sa.Column('baseline_value', sa.Float, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
    )

    # Datasets table
    op.create_table(
        'datasets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('region', sa.String(100), nullable=False, default='Global'),
        sa.Column('date_range', postgresql.JSON, nullable=True),
        sa.Column('file_path', sa.String(500), nullable=True),
        sa.Column('record_count', sa.Integer, default=0),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('datasets')
    op.drop_table('projection_results')
    op.drop_table('simulation_runs')
    op.drop_table('scenarios')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS simulation_status')
    op.execute('DROP TYPE IF EXISTS user_role')
