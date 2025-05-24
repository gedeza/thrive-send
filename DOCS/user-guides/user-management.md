---
title: "User Management Guide"
description: "Learn how to manage users, roles, and permissions in Thrive Send"
---

# User Management Guide

Learn how to manage users, roles, and permissions in Thrive Send's user management system.

## Overview

Thrive Send's user management system provides a secure and flexible platform for managing team access and permissions. The system includes role-based access control, user activity tracking, and team collaboration features.

![User Management Interface](/docs/images/user-management.svg)

## Quick Navigation

<div class="tabs">
  <div class="tab-buttons">
    <button class="tab-button active" data-tab="roles">
      <i class="icon roles-icon"></i>
      Roles & Permissions
    </button>
    <button class="tab-button" data-tab="users">
      <i class="icon users-icon"></i>
      User Management
    </button>
    <button class="tab-button" data-tab="teams">
      <i class="icon teams-icon"></i>
      Team Management
    </button>
    <button class="tab-button" data-tab="analytics">
      <i class="icon analytics-icon"></i>
      Analytics & Security
    </button>
  </div>

  <div class="tab-content">
    <!-- Roles & Permissions Tab -->
    <div class="tab-pane active" id="roles">
      <div class="tab-header">
        <h3>Role Types</h3>
        <div class="tab-actions">
          <button class="action-button" onclick="printSection('roles')">
            <i class="icon print-icon"></i>
            Print
          </button>
          <button class="action-button" onclick="copySection('roles')">
            <i class="icon copy-icon"></i>
            Copy
          </button>
        </div>
      </div>
      <div class="tab-body">
        ![Role Hierarchy](/docs/images/role-hierarchy.svg)
        ![Permission Matrix](/docs/images/permission-matrix.svg)

        <div class="code-section">
          ### Administrator
          ```typescript
          const adminRole = {
            name: "Administrator",
            permissions: [
              "manage_users",
              "manage_roles",
              "manage_settings",
              "view_analytics",
              "manage_campaigns",
              "manage_content"
            ]
          };
          ```

          ### Editor
          ```typescript
          const editorRole = {
            name: "Editor",
            permissions: [
              "create_content",
              "edit_content",
              "publish_content",
              "view_analytics"
            ]
          };
          ```

          ### Author
          ```typescript
          const authorRole = {
            name: "Author",
            permissions: [
              "create_content",
              "edit_own_content",
              "view_own_analytics"
            ]
          };
          ```

          ### Viewer
          ```typescript
          const viewerRole = {
            name: "Viewer",
            permissions: [
              "view_content",
              "view_analytics"
            ]
          };
          ```
        </div>
      </div>
    </div>

    <!-- User Management Tab -->
    <div class="tab-pane" id="users">
      <div class="tab-header">
        <h3>Managing Users</h3>
        <div class="tab-actions">
          <button class="action-button" onclick="printSection('users')">
            <i class="icon print-icon"></i>
            Print
          </button>
          <button class="action-button" onclick="copySection('users')">
            <i class="icon copy-icon"></i>
            Copy
          </button>
        </div>
      </div>
      <div class="tab-body">
        <div class="code-section">
          ### Create New User
          ```typescript
          const createUser = async (userData: UserData) => {
            const user = await api.post('/users', {
              email: userData.email,
              name: userData.name,
              role: userData.role,
              permissions: userData.permissions
            });
            return user;
          };
          ```

          ### Assign Role
          - Select user from directory
          - Choose appropriate role
          - Set custom permissions
          - Save changes

          ### Configure Access
          - Set team access
          - Define content permissions
          - Configure notification preferences
        </div>
      </div>
    </div>

    <!-- Team Management Tab -->
    <div class="tab-pane" id="teams">
      <div class="tab-header">
        <h3>Team Management</h3>
        <div class="tab-actions">
          <button class="action-button" onclick="printSection('teams')">
            <i class="icon print-icon"></i>
            Print
          </button>
          <button class="action-button" onclick="copySection('teams')">
            <i class="icon copy-icon"></i>
            Copy
          </button>
        </div>
      </div>
      <div class="tab-body">
        ![Workflow Management Interface](/docs/images/workflow-management.svg)

        <div class="code-section">
          ### Creating Teams
          ```typescript
          const createTeam = async (teamData: TeamData) => {
            const team = await api.post('/teams', {
              name: teamData.name,
              members: teamData.members,
              permissions: teamData.permissions
            });
            return team;
          };
          ```

          ### Managing Team Members
          - Add/remove members
          - Assign team roles
          - Set team permissions

          ### Team Collaboration
          - Share resources
          - Set up workflows
          - Configure notifications
        </div>
      </div>
    </div>

    <!-- Analytics & Security Tab -->
    <div class="tab-pane" id="analytics">
      <div class="tab-header">
        <h3>Analytics & Security</h3>
        <div class="tab-actions">
          <button class="action-button" onclick="printSection('analytics')">
            <i class="icon print-icon"></i>
            Print
          </button>
          <button class="action-button" onclick="copySection('analytics')">
            <i class="icon copy-icon"></i>
            Copy
          </button>
        </div>
      </div>
      <div class="tab-body">
        ![Content Analytics Dashboard](/docs/images/content-analytics.svg)

        <div class="code-section">
          ### Activity Tracking
          ```typescript
          const trackUserActivity = async (userId: string, action: string) => {
            const activity = await api.post('/activity', {
              userId,
              action,
              timestamp: new Date(),
              metadata: {
                ip: request.ip,
                userAgent: request.headers['user-agent']
              }
            });
            return activity;
          };
          ```

          ### Security Features
          - Two-factor authentication
          - IP restrictions
          - Session management
          - Password policies

          ### Security Monitoring
          ```typescript
          const monitorSecurity = async () => {
            const alerts = await api.get('/security/alerts');
            return {
              failedLogins: alerts.failedLogins,
              suspiciousActivity: alerts.suspiciousActivity,
              securityBreaches: alerts.breaches
            };
          };
          ```
        </div>
      </div>
    </div>
  </div>
</div>

## Best Practices

### User Management
- Follow principle of least privilege
- Regular permission reviews
- Document role changes
- Maintain audit trail

### Security Measures
- Regular password updates
- Access review cycles
- Security training
- Incident response plan

## Next Steps

- Explore the [Analytics Guide](/docs/analytics) to track user activity
- Learn about [Campaign Management](/docs/campaign-management) for team collaboration
- Review [Content Management](/docs/content-management) for content workflows

<style>
.tabs {
  margin: 20px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.tab-buttons {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-button:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.tab-button.active {
  background: #4a90e2;
  color: white;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
}

.tab-content {
  margin-top: 20px;
}

.tab-pane {
  display: none;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.tab-pane.active {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.tab-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f8f9fa;
  border-color: #4a90e2;
  color: #4a90e2;
}

.tab-body {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
}

.code-section {
  margin-top: 20px;
}

.icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-size: contain;
  background-repeat: no-repeat;
}

.roles-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'); }
.users-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>'); }
.teams-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.62c0-1.17.68-2.25 1.76-2.73 1.17-.51 2.61-.9 4.24-.9zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/></svg>'); }
.analytics-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>'); }
.print-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>'); }
.copy-icon { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>'); }

@media (max-width: 768px) {
  .tab-buttons {
    flex-direction: column;
  }
  
  .tab-button {
    width: 100%;
  }
  
  .tab-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .tab-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none';
      });

      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const activePane = document.getElementById(tabId);
      activePane.classList.add('active');
      activePane.style.display = 'block';
    });
  });

  // Print section
  window.printSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print ${sectionId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 5px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          ${section.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Copy section
  window.copySection = function(sectionId) {
    const section = document.getElementById(sectionId);
    const text = section.innerText;
    navigator.clipboard.writeText(text).then(() => {
      const button = document.querySelector(`[onclick="copySection('${sectionId}')"]`);
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="icon check-icon"></i> Copied!';
      setTimeout(() => {
        button.innerHTML = originalText;
      }, 2000);
    });
  };
});
</script> 